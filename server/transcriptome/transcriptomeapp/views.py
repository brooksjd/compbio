from django.core import serializers
from django.http import HttpResponse
from django.template import RequestContext, loader
import logging, string, os
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.core.context_processors import csrf
import simplejson as json
import math, random
from django.core.files import File

from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt

from transcriptome.transcriptomeapp.models import Experiment, Exon, Gene, Read, Result, Transcript, Truth, TruthTranscript

logger = logging.getLogger(__name__)

def home(request):
    t = loader.get_template('transcriptGame.html')    
    c = RequestContext(request, {
        
        })
    return HttpResponse(t.render(c))

def get_puzzle(request):
    puzzle = {}
    t_puzzle = {}    
    read_length = 75
    max_allowable_exon_height = 38
    junction_norm = read_length * 2
    scoring_version = '1.1.0'
    
    acceptable_puzzle = False
    while not acceptable_puzzle:
        acceptable_puzzle = True         
        
        highest_read_id = Read.objects.order_by('-id')[0].id
        print 'highest_read_id: ' + str(highest_read_id) 
        lowest_read_id = Read.objects.order_by('id')[0].id
        print 'lowest_read_id: ' + str(lowest_read_id)
        
        selected_index = random.randint(lowest_read_id, highest_read_id)
#        selected_index = 36566
        print 'selected_index: ' + str(selected_index)
        selected_read = Read.objects.order_by('id').filter(id__gte=selected_index)[0]
        
        experiment = selected_read.experiment
        print 'experiment: ' + str(experiment.id)
        gene = selected_read.exons.all()[0].gene
        
        exons = Exon.objects.filter(gene=gene)
        
        exon_dict = {}
        exon_id_list = []
        for i, exon in enumerate(exons):
            exon_dict[exon.id] = i
            exon_id_list.append(exon.id)
        print 'exon_dict: ' + str(exon_dict)
        
        exon_array = []
        junction_array = []
        width_array = []
        
        t_exon_array = []
        t_junction_array = []
        
        smallest_length = 1000000 # Some really large number
        
        for i, exon in enumerate(exons):
            if not acceptable_puzzle:
                break
            
            main_read = 0
            t_main_read = 0
            main_exon_id = exon_dict[exon.id]
            reads = Read.objects.filter(experiment=experiment).filter(exons__id=exon.id).all()
            cur_width = exon.end - exon.start
            width_array.append(cur_width)
            
            for read in reads:
                if read.exons.count() == 1:
                    main_read = read.readCount
                    t_main_read = main_read
                    
                    main_read = float(main_read) / cur_width
                    smallest_length = min(smallest_length, main_read)
                else:
                    junctions = []
                    t_junctions = []
                    
                    other_exons = read.exons.all()
                    for other_exon in other_exons:
                        other_exon_id = exon_dict[other_exon.id]
                        
                        if main_exon_id <= other_exon_id:
                            junctions.append(other_exon_id)
                            t_junctions.append(other_exon_id)
                        else:
                            junctions = []
                            t_junctions = []
                            break
                        
                    if junctions:
                        if len(junctions) > 2:
                            print 'More than 2 exons: ' + str(len(junctions))
                            acceptable_puzzle = False
                            break
                        
                        t_junction_width = read.readCount
                        junction_width = float(read.readCount)/junction_norm
                        
                        smallest_length = min(smallest_length, junction_width)
                        junctions.append(junction_width)
                        junction_array.append(junctions)
                        
                        t_junctions.append(t_junction_width)
                        t_junction_array.append(t_junctions)
                    
            exon_array.append(main_read)
            t_exon_array.append(t_main_read)
        
        scaling_factor = 1.0/smallest_length
        print 'scaling_factor: ' + str(scaling_factor)
        
        # Normalize lengths:
        for junction in junction_array:
            junction[len(junction) - 1] = int(round(junction[len(junction) - 1] * scaling_factor))
            
        scaled_exon_array = []
        for exon in exon_array:
            scaled_exon_array.append(int(round(exon * scaling_factor))) 
            
        # Check height
        exon_height = [0 for i in range(len(exons))]
        for j, exon_count in enumerate(scaled_exon_array):
            exon_height[j] = exon_count
            
        for junction_details in junction_array:
            for j in range(len(junction_details) - 1):
                exon_height[junction_details[j]] += junction_details[len(junction_details) - 1]
                
        if max(exon_height) > max_allowable_exon_height:
            print 'Exceeded acceptable height'
            acceptable_puzzle = False
    
    puzzle['exons'] = scaled_exon_array
    puzzle['junctions'] = junction_array
    puzzle['widths'] = width_array
    puzzle['experiment'] = experiment.id
    puzzle['exon_ids'] = exon_id_list
    puzzle['gene'] = gene.id
    puzzle['version'] = scoring_version
    
    t_puzzle['exons'] = t_exon_array
    t_puzzle['junctions'] = t_junction_array
    t_puzzle['widths'] = width_array
    
    return HttpResponse(content=json.dumps(puzzle), content_type="text/html; charset=utf-8")

@csrf_exempt
def user_result(request):
#    json_result = request.POST['result']
#    result_dict = json.load(json_result)
    
    gene = Gene.objects.get(id=int(request.POST['gene']))
    print 'gene: ' + str(gene.id)
    experiment = Experiment.objects.get(id=int(request.POST['experiment']))
    
    print 'experiment: ' + str(experiment.id)
    print 'raw exons params: ' + request.POST['exon_ids']
    print 'exons params after parsing: ' + str(json.loads(request.POST['exon_ids']))
    exon_ids = json.loads(request.POST['exon_ids'])
    exons = []
    for exon_id in exon_ids:
        print 'about to search for exon: ' + str(exon_id)
        exons.append(Exon.objects.get(id=int(exon_id)))
        print 'found exon: ' + str(exon_id)
        
    exon_dict = {}
    transcript_dict = {}
    transcript_object_dict = {}
    truth_expressions = []
    for i, exon_id in enumerate(exon_ids):
        exon_dict[int(exon_id)] = i        
    
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
    except KeyError:
        pass
    sum_truth_expressions = sum(truth_expressions)
    
    print 'transcript_dict: ' + str(transcript_dict)
    print 'truth_expressions: ' + str(truth_expressions)
    
    print 'About to save result'
    result = Result(gene=gene, experiment=experiment, score=float(request.POST['score']), version=request.POST['version'], truth=truth)
    result.save()
    
    expressions = json.loads(request.POST['expressions'])
    expressions = [float(expression) for expression in expressions]
    sum_expressions = sum(expressions)
    transcripts = json.loads(request.POST['transcripts'])
    
    transcript_scores = []
    found_transcripts = 0
    
    print 'number of transcripts: ' + str(len(transcripts))
    for i, transcript_exons in enumerate(transcripts):
        print 'about to save transcript with expression: ' + str(expressions[i])
        transcript = Transcript(result=result, expression=expressions[i])
        transcript.save()
        print 'after saving transcript with expression: ' + str(float(expressions[i]))
        
        transcript_list = ['0' for j in range(len(transcript_exons))]
        for j, transcript_exon in enumerate(transcript_exons):
            print 'checking whether to add exon: ' + str(j)
            if transcript_exon == 1:
                transcript_list[j] = '1'
                print 'adding exon: ' + str(exons[j])
                transcript.exons.add(exons[j])
                print 'finished adding exon: ' + str(exons[j])
        
        transcript_key = "".join(transcript_list)     
        
        try:
            found_transcript_expression = transcript_dict[transcript_key]
            found_transcript = transcript_object_dict[transcript_key]
            
            found_transcripts += 1
            
            this_expression = expressions[i]/sum_expressions
            that_expression = found_transcript_expression/sum_truth_expressions
            expression_diff =  1 - abs(that_expression - this_expression) # subtract from 1 to make higher better
            print 'this/that expression: ' + str(this_expression) + '/' + str(that_expression)
            
            transcript.truthScore = expression_diff
            transcript.truthTranscript = found_transcript
            transcript.save()
            
            transcript_scores.append(expression_diff)
            
        except KeyError:
            print 'Could not find transcript: ' + transcript_key
            pass
        
    result.truthPrecision = float(found_transcripts)/len(transcripts)
    result.truthRecall = float(found_transcripts)/len(truth_transcripts)
    
    result.truthScore = sum(transcript_scores)/max(len(transcripts), len(truth_transcripts))
    result.save()
        
    return HttpResponse('Success', content_type="text/html; charset=utf-8")