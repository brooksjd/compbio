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
import math
from django.core.files import File

from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)

def home(request):
    pass
