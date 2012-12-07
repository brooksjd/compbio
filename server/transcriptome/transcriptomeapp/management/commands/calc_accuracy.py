from django.core.management.base import BaseCommand
from django.db.models import Count
from transcriptome.transcriptomeapp.models import Experiment, Exon, Gene, Read, Result, Transcript, Truth, TruthTranscript
from django.db.models import Q
import sys

class Command(BaseCommand):
    help = 'Loads the database with reads'
    
    def handle(self, *args, **options):
        unscored_results = Result.objects.filter(truthPrecision=None).all()
        
        for unscored_result in unscored_results:
            gene = unscored_result.gene
            experiment = unscored_result.experiment
            
            exons = Exon.objects.filter(gene=gene).all()
                
            exon_dict = {}
            transcript_dict = {}
            for i, exon in enumerate(exons):
                exon_dict[exon.id] = i        
            
            # Look for truth
            truth_transcripts = []
            try:
                truth = Truth.objects.get(experiment=experiment, gene=gene)
                truth_transcripts = TruthTranscript.objects.filter(truth=truth).all()
                for truth_transcript in truth_transcripts:
                    transcript_exon_list = ['0' for i in range(len(exon_dict))]
                    for transcript_exon in truth_transcript.exons.all():
                        transcript_exon_list[exon_dict[transcript_exon.id]] = '1'
                        
                    truth_transcript_key = "".join(transcript_exon_list)
                    transcript_dict[truth_transcript_key] = truth_transcript.expression
                                        
                print 'unscored_result.truth: ' + str(unscored_result.id) + ' : ' + str(truth.id)
            except KeyError:
                pass
            
            transcripts = Transcript.objects.filter(result=unscored_result).all()
                        
            found_transcripts = 0
            
            for i, transcript in enumerate(transcripts):
                
                transcript_list = ['0' for j in range(len(exon_dict))]
                for transcript_exon in transcript.exons.all():
                    transcript_list[exon_dict[transcript_exon.id]] = '1'
                
                transcript_key = "".join(transcript_list)     
                
                try:
                    _ = transcript_dict[transcript_key]    
                    found_transcripts += 1
                except KeyError:
                    print 'Could not find transcript: ' + transcript_key
                    pass
                
            try:
                unscored_result.truthPrecision = float(found_transcripts)/len(transcripts)
            except ZeroDivisionError:
                print 'No transcript error'
                print unscored_result.id
                sys.exit()
                
            unscored_result.truthRecall = float(found_transcripts)/len(truth_transcripts)
            unscored_result.save()