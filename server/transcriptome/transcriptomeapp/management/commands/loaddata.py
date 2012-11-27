from django.core.management.base import BaseCommand
from django.db.models import Count
from transcriptome.transcriptomeapp.models import Experiment, Exon, Gene, Read
import sys

class Command(BaseCommand):
    help = 'Loads the database with reads'
    
    def handle(self, *args, **options):
        line_count_step = 100
        
        line_count = 0
        gtf_file_name = args[0]
        input_file_name = args[1]
        expt_desc = args[2]
        
        gtf_file = open(gtf_file_name)
        
        experiment = Experiment(description=expt_desc)
        experiment.save()
        
        exons = {}
        print 'Reading gtf'
        for line in gtf_file:
            line_count += 1
            if line_count % line_count_step == 0:
                print 'Working on gtf line ' + str(line_count)            
            
            tokens = line.split('\t')
            
            exon_start = int(tokens[3])
            exon_stop = int(tokens[4])
            
            details = tokens[8]
            details_tokens = details.split(';')
            
            gene_id = details_tokens[0].strip()
            gene_id = gene_id[9:len(gene_id) - 1]
            
            possible_matches = exons.setdefault(gene_id, [])
            existing = [exon_start, exon_stop]
            existing_possible_match = False
            
            for possible_match in possible_matches:
                if not (possible_match[1] <= exon_start or possible_match[0] >= exon_stop):
                    existing[0] = min(possible_match[0], existing[0])
                    existing[1] = max(possible_match[1], existing[1])
                    existing_possible_match = True
                    break 
            
            try:
                if existing_possible_match:
                    exon = possible_match[2]
                else:
                    try:
                        gene = Gene.objects.get(name=gene_id)
                    except Gene.DoesNotExist:
                        gene = Gene(name=gene_id)
                        gene.save()
                        
                    exon = Exon.objects.get(start__lt=existing[1], end__gt=existing[0], gene=gene)
                                            
                exon.start = existing[0]
                exon.end = existing[1]
                exon.save()                
            except Exon.DoesNotExist:                    
                exon = Exon(start=existing[0], end=existing[1], gene=gene)
                exon.save()
            
            if existing_possible_match:
                possible_match[0] = existing[0]
                possible_match[1] = existing[1]
            else:
                exons[gene_id].append([existing[0], existing[1], exon])                
                    
        input_file = open(input_file_name)
        
        print 'Reading reads'
        line_count = 0
        for line in input_file:
            line_count += 1
            if line_count % line_count_step == 0:
                print 'Working on read line ' + str(line_count) 
                
            tokens = line.split('\t')
            
            if tokens[0].rstrip() == 'polyA':
                continue
            
            read_start = int(tokens[1])
            read_stop = int(tokens[2])            
            exon_num = int(tokens[9])
            
            # Hack to make searching faster. May not work on TopHat output
            desc = tokens[3]
            desc_tokens = desc.split(':')
            transcript_id = desc_tokens[2]
            transcript_tokens = transcript_id.split('.')
            gene_id = transcript_tokens[0]
            
            matches = []
            
            possible_matches = exons[gene_id]
            for possible_match in possible_matches:
                if not (possible_match[1] <= read_start or possible_match[0] >= read_stop):
                    matches.append(possible_match)
                    
                    if len(matches) >= exon_num:
                        break;
                        
            matches_exons = []
            for match in matches:
                matches_exons.append(match[2])
                
            try:
                read = Read.objects.annotate(num_exons=Count('exons')).filter(num_exons=len(matches_exons), experiment=experiment)
                for t_matches_exon in matches_exons:
                    read = read.filter(exons__id__contains=t_matches_exon.id)
                read = read.get()
                    
                read.readCount = read.readCount + 1
                read.save()
            except Read.DoesNotExist:                 
                read = Read(experiment=experiment, readCount=1)
                read.save()
                for matches_exon in matches_exons:
                    read.exons.add(matches_exon) 
            