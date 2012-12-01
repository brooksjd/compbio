from django.core.management.base import BaseCommand
from django.db.models import Count
from transcriptome.transcriptomeapp.models import Experiment, Exon, Gene, Read
import sys

class Command(BaseCommand):
    help = 'Debug loaddata command'
    
    def handle(self, *args, **options):
        experiment = Experiment.objects.get()
        
        debug_data = open('debug_data.bed')
        
        for line in debug_data:   
            tokens = line.split('\t')
            
            if tokens[0].rstrip() == 'polyA':
                continue
            
            read_start = int(tokens[1])
            read_stop = int(tokens[2]) 
            
            desc = tokens[3]
            desc_tokens = desc.split(':')
            transcript_id = desc_tokens[2]
            transcript_tokens = transcript_id.split('.')
            gene_id = transcript_tokens[0]
            
            matches_exons = Exon.objects.filter(gene__name=gene_id, start__lt=read_stop, end__gt=read_start)
            matches_exons = matches_exons.all()
              
            print 'Search for read: ' + str([read_start, read_stop]) + " : " + str(matches_exons[0].id)   
            try:
                read = Read.objects.annotate(num_exons=Count('exons')).filter(num_exons=len(matches_exons), experiment=experiment)
                print 'QuerySet count: ' + str(read.count())
                for t_matches_exon in matches_exons:
                    read = read.filter(exons__id=t_matches_exon.id)
                    print 'QuerySet count: ' + str(read.count())
                    
                try:
                    read = read.get()
                except Read.MultipleObjectsReturned:
                    for temp_re in read:
                        for t_e in temp_re.exons.all():
                            print t_e.id
                    
                print 'Found read: ' + str([read_start, read_stop]) + " : " + str(len(matches_exons))
                for t_e in read.exons.all():
                    print t_e.id 
            except Read.DoesNotExist:                 
                print 'Could not find: ' + str([read_start, read_stop]) + " : " + str(len(matches_exons))
            