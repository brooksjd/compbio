from django.core.management.base import BaseCommand
from django.db.models import Count
from transcriptome.transcriptomeapp.models import Experiment, Exon, Gene, Read
import sys

class Command(BaseCommand):
    help = 'Debug loaddata command'
    
    def handle(self, *args, **options):
        
        experiment = Experiment.objects.get()
        
        genes = Gene.objects.all()
        for gene in genes:
            print 'Gene: ' + gene.name + '\n'
            gene = Gene.objects.filter(name=gene.name).get()
            
            exons = Exon.objects.filter(gene=gene)
            for i, exon in enumerate(exons):
                main_read = 0
                reads = Read.objects.filter(experiment=experiment).filter(exons__id=exon.id).all()
                junctions = []
                for read in reads:
                    if read.exons.count() == 1:
                        main_read = read.readCount
                    else:
                        others = ''
                        other_exons = read.exons.all()
                        for other_exon in other_exons:
                            others += ', ' + str(other_exon.id)
                            
                        junctions.append(others + ': ' + str(read.readCount))
                
                print '\tExon ' + str(exon.id) + ' | Read count: ' + str(main_read) + ' | Length: ' + str(exon.end - exon.start)
                for junction in junctions:
                    print '\t\tJunction ' + junction
                    
            print '\n--------------------\n'
            