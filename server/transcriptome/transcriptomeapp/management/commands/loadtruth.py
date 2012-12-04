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
            transcript_id = transcript_id[15:len(transcript_id) - 1]
            
            transcripts.setdefault(transcript_id, []).append((exon_start, exon_stop))              
                    
        expression_profile = open(expression_profile)
        print 'Reading profile'
        line_count = 0
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
                truth.save()
                
            # Find exons
            exon_limits = transcripts[transcript_id]
            exons = []
            for exon_limit in exon_limits:
                try:
                    exons.append(Exon.objects.get(end__gt=exon_limit[0], start__lt=exon_limit[1], gene=gene))
                except Exon.MultipleObjectsReturned:
                    print 'transcript_id: ' + str(transcript_id)
                    print 'exon_limits: ' + str(exon_limits)
                    print 'exon_limit: ' + str(exon_limit)
                    print 'gene: ' + str(gene.id)
                    
                    found_exons = Exon.objects.filter(end__gt=exon_limit[0], start__lt=exon_limit[1], gene=gene).all()
                    for found_exon in found_exons:
                        print 'found_exon: ' + str(found_exon.id) + ' : ' + str(found_exon.start) + ' : ' + str(found_exon.end)
                    sys.exit()
                
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