from django.core.management.base import BaseCommand
from django.db.models import Count
from transcriptome.transcriptomeapp.models import Experiment, Exon, Gene, Read
import sys

class Command(BaseCommand):
    help = 'Loads the database with reads'
    
    def handle(self, *args, **options):
        print 'Script called' + args[0] + args[1]
        gtf_file_name = args[0]
        input_file_name = args[1]
        expt_desc = args[2]
        
        gtf_file = open(gtf_file_name)
        
        experiment = Experiment(description=expt_desc)
        experiment.save()
        
        exons = {}
        for line in gtf_file:
            print line
            tokens = line.split('\t')
            
            exon_start = int(tokens[3])
            exon_stop = int(tokens[4])
            
            details = tokens[8]
            details_tokens = details.split(';')
            print details_tokens
            
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
                    exon = Exon.objects.get(start__lt=existing[1], end__gt=existing[0])
                exon.start = existing[0]
                exon.end = existing[1]
                exon.save()                
            except Exon.DoesNotExist:
                try:
                    gene = Gene.objects.get(name=gene_id)
                except Gene.DoesNotExist:
                    gene = Gene(name=gene_id)
                    gene.save()
                    
                exon = Exon(start=existing[0], end=existing[1], gene=gene)
                exon.save()
            
            if existing_possible_match:
                possible_match[0] = existing[0]
                possible_match[1] = existing[1]
            else:
                exons[gene_id].append([existing[0], existing[1], exon])                
                    
        input_file = open(input_file_name)
        
        for line in input_file:
            tokens = line.split('\t')
            
            if tokens[0].rstrip() == 'polyA':
                continue
            
            read_start = int(tokens[1])
            read_stop = int(tokens[2])            
            exon_num = int(tokens[9])
            print 'exon_num=' + str(exon_num)
            
            # Hack to make searching faster. May not work on TopHat output
            desc = tokens[3]
            desc_tokens = desc.split(':')
            transcript_id = desc_tokens[2]
            transcript_tokens = transcript_id.split('.')
            gene_id = transcript_tokens[0]
            
            matches = []
            
            possible_matches = exons[gene_id]
            for possible_match in possible_matches:
                print str(possible_match) + " : " + str([read_start, read_stop]) + " : " + str((possible_match[1] <= read_start or possible_match[0] >= read_stop))
                if not (possible_match[1] <= read_start or possible_match[0] >= read_stop):
                    matches.append(possible_match)
                    
                    if len(matches) >= exon_num:
                        print 'found enough matching exons'
                        break;
            
            print 'matched exons=' + str(len(matches))        
            
            matches_exons = []
            for match in matches:
                matches_exons.append(match[2])
                
            try:
                try:
#                    read = Read.objects.annotate(num_exons=Count('exons')).get(exons__in=matches_exons, num_exons=len(matches_exons), experiment=experiment)
                    read = Read.objects.annotate(num_exons=Count('exons')).filter(num_exons=len(matches_exons), experiment=experiment)
                    for t_matches_exon in matches_exons:
                        read = read.filter(exons__id__contains=t_matches_exon.id)
                    read = read.get()
                except Read.MultipleObjectsReturned:
                    print "Exception thrown"
                    read = Read.objects.annotate(num_exons=Count('exons')).filter(exons__in=matches_exons, num_exons=len(matches_exons), experiment=experiment)
                    reads = read.all()
                    print "Num of reads found=" + str(len(reads))
                    for read in reads:
                        print [str(read_exon.start) + "-" + str(read_exon.end) for read_exon in read.exons.all()]
                    sys.exit()
                    
                print "Number of exons in read" + str(read.exons.count())
                read.readCount = read.readCount + 1
                read.save()
            except Read.DoesNotExist: 
                print "Could not find read" 
                print [t_matches_exon.id for t_matches_exon in matches_exons]
                tmp = Read.objects.annotate(num_exons=Count('exons')).filter(num_exons=len(matches_exons), experiment=experiment)
                for t_matches_exon in matches_exons:
                    tmp = tmp.filter(exons__id__contains=t_matches_exon.id)
                tmp = tmp.all()
                
                for t in tmp:
                    print t.num_exons
                    
                tmp = Read.objects.annotate(num_exons=Count('exons')).filter(num_exons=len(matches_exons), experiment=experiment)
                tmp = tmp.all()
                if tmp:
                    for t_exon in tmp[0].exons.all():
                        print 'Exon id: ' + str(t_exon.id)
                
                read = Read(experiment=experiment, readCount=1)
                read.save()
                for matches_exon in matches_exons:
                    print "Adding read: " + str(read_start) + "-" + str(read_stop) + " : " + str(matches_exon.start) + " : " + str(matches_exon.end) + " : " + str(matches_exon.id) 
                    read.exons.add(matches_exon) 
            