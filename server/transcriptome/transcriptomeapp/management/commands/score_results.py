from django.core.management.base import BaseCommand
from django.db.models import Count
from transcriptome.transcriptomeapp.models import Experiment, Exon, Gene, Read, Result, Transcript, Truth, TruthTranscript
from django.db.models import Q
import sys

class Command(BaseCommand):
    help = 'Loads the database with reads'
    
    def handle(self, *args, **options):
        unscored_results = Result.objects.filter(Q(truthScore=None)).all()
        
        for unscored_result in unscored_results:
            gene = unscored_result.gene
            experiment = unscored_result.experiment
            
            exons = Exon.objects.filter(gene=gene).all()
                
            exon_dict = {}
            transcript_dict = {}
            transcript_object_dict = {}
            truth_expressions = []
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
                    transcript_object_dict[truth_transcript_key] = truth_transcript
                    
                    truth_expressions.append(truth_transcript.expression)
                    
                unscored_result.truth = truth
                print 'unscored_result.truth: ' + str(unscored_result.id) + ' : ' + str(truth.id)
            except KeyError:
                pass
            sum_truth_expressions = sum(truth_expressions)
            
            expressions = []
            transcripts = Transcript.objects.filter(result=unscored_result).all()
            
            transcript_scores = []
            
            for i, transcript in enumerate(transcripts):
                expressions.append(transcript.expression)
                
            sum_expressions = sum(expressions)
            
            for i, transcript in enumerate(transcripts):
                
                transcript_list = ['0' for j in range(len(exon_dict))]
                for transcript_exon in transcript.exons.all():
                    transcript_list[exon_dict[transcript_exon.id]] = '1'
                
                transcript_key = "".join(transcript_list)     
                
                try:
                    found_transcript_expression = transcript_dict[transcript_key]
                    found_transcript = transcript_object_dict[transcript_key]
                    
                    this_expression = expressions[i]/sum_expressions
                    that_expression = found_transcript_expression/sum_truth_expressions
                    expression_diff =  1 - abs(that_expression - this_expression) # subtract from 1 to make higher better
                    
                    transcript.truthScore = expression_diff
                    transcript.truthTranscript = found_transcript
                    
                    print 'transcript.truthScore: ' + str(transcript.id) + ' : ' + str(transcript.truthScore)
                    print 'transcript.truthTranscript: ' + str(transcript.id) + ' : ' + str(transcript.truthTranscript)
                    transcript.save()
                    
                    transcript_scores.append(expression_diff)
                    
                except KeyError:
                    print 'Could not find transcript: ' + transcript_key
                    pass
                
            unscored_result.truthScore = sum(transcript_scores)/max(len(transcripts), len(truth_transcripts))
            print 'unscored_result.truthScore: ' + str(unscored_result.id) + ' : ' + str(unscored_result.truthScore)
            print '\n\n------------------------\n\n'
            unscored_result.save()