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

from transcriptome.transcriptomeapp.models import Experiment, Exon, Gene, Read

logger = logging.getLogger(__name__)

def home(request):
    t = loader.get_template('transcriptGame.html')    
    c = RequestContext(request, {
        
        })
    return HttpResponse(t.render(c))

def get_puzzle(request):
    puzzle = {}
    
    highest_read_id = Read.objects.order_by('-id')[0].id
    print 'highest_read_id: ' + str(highest_read_id) 
    lowest_read_id = Read.objects.order_by('id')[0].id
    print 'lowest_read_id: ' + str(lowest_read_id)
    
    selected_index = random.randint(lowest_read_id, highest_read_id)
    print 'selected_index: ' + str(selected_index)
    selected_read = Read.objects.order_by('id').filter(id__gte=selected_index)[0]
    
    experiment = selected_read.experiment
    print 'experiment: ' + str(experiment.id)
    gene = selected_read.exons.all()[0].gene
    
    exons = Exon.objects.filter(gene=gene)
    
    exon_dict = {}
    for i, exon in enumerate(exons):
        exon_dict[exon.id] = i
    print 'exon_dict: ' + str(exon_dict)
    
    exon_array = []
    junction_array = []
    width_array = []
    
    for i, exon in enumerate(exons):
        main_read = 0
        main_exon_id = exon_dict[exon.id]
        reads = Read.objects.filter(experiment=experiment).filter(exons__id=exon.id).all()
        width_array.append(exon.end - exon.start)
        
        for read in reads:
            if read.exons.count() == 1:
                main_read = read.readCount
            else:
                junctions = []
                other_exons = read.exons.all()
                for other_exon in other_exons:
                    other_exon_id = exon_dict[other_exon.id]
                    
                    if main_exon_id <= other_exon_id:
                        junctions.append(other_exon_id)
                    else:
                        junctions = []
                        break
                    
                if junctions:
                    junctions.append(read.readCount)
                    junction_array.append(junctions)
                
        exon_array.append(main_read)
    
    puzzle['exons'] = exon_array
    puzzle['junctions'] = junction_array
    puzzle['widths'] = width_array
    
    return HttpResponse(content=json.dumps(puzzle), content_type="text/html; charset=utf-8")
