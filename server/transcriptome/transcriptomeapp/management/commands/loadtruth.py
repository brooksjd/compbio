from django.core.management.base import BaseCommand
from django.db.models import Count
from transcriptome.transcriptomeapp.models import Experiment, Exon, Gene, Read, Truth, TruthTranscript
import sys

class Command(BaseCommand):
    help = 'Loads the database with reads'
    
    def handle(self, *args, **options):
        line_count_step = 100
        
        line_count = 0
        gtf_file_name = args[0]
        expression_profile = args[1]
        expt_desc = args[2]
        
        gtf_file = open(gtf_file_name)
        
        experiment = Experiment.objects.get(description=expt_desc)
        
        exons = {}
        transcripts = {}
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
            
            transcript_id = details_tokens[1].strip()
            transcript_id = transcript_id[9:len(transcript_id) - 1]
            
            transcripts.setdefault(transcript_id, []).append((exon_start, exon_stop))              
                    
        sufficiently_expressed_genes = {}
        expression_profile = open(expression_profile)
        print 'Reading profile'
        line_count = 0
        old_gene = ''
        expressed_count = 0
        for line in expression_profile:
            line_count += 1
            if line_count % line_count_step == 0:
                print 'Working on profile line ' + str(line_count)
                
            tokens = line.split('\t')
            
            transcript_id = tokens[1]
            gene_name = transcript_id.split('.')[0]
            expression_level = int(tokens[5])
            
            gene = Gene.objects.get(name=gene_name)
            
            try:
                truth = Truth.objects.get(gene=gene, experiment=experiment)
            except Truth.DoesNotExist:
                truth = Truth(gene=gene, experiment=experiment)
                
            # Find exons
            exon_limits = transcripts[transcript_id]
            exons = []
            for exon_limit in exon_limits:
                exons.append(Exon.objects.get(end__gt=exon_limit[0], start__lt=exon_limit[1], gene=gene))
                
            # See if such a truth transcript exists first
            truth_transcript = TruthTranscript.objects.filter(truth=truth, exonCount=len(exons))
            for exon in exons:
                truth_transcript.filter(exons__id=exon.id)
            try:
                truth_transcript.get() 
                # exists
            except TruthTranscript.DoesNotExist:
                # Does not exist, therefore create
                truth_transcript = TruthTranscript(truth=truth, exonCount=len(exons), expression=expression_level)
                truth_transcript.save()
                for exon in exons:
                    truth_transcript.exons.add(exon)            
                    
        print 'Number of sufficiently expressed genes: ' + str(len(sufficiently_expressed_genes))
        
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
            
            try:
                _ = sufficiently_expressed_genes[gene_id]
            except:                
                continue
            
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
                read = Read.objects.filter(exonCount=len(matches_exons), experiment=experiment)
                for t_matches_exon in matches_exons:
                    read = read.filter(exons__id=t_matches_exon.id)
                read = read.get()
                    
                read.readCount = read.readCount + 1
                read.save()
            except Read.DoesNotExist:                 
                read = Read(experiment=experiment, readCount=1, exonCount=len(matches_exons))
                read.save()
                for matches_exon in matches_exons:
                    read.exons.add(matches_exon) 
            