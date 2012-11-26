from transcriptome.transcriptomeapp.models import Experiment, Gene, Read, Exon, Result, Transcript
from django.contrib import admin

admin.site.register(Experiment)
admin.site.register(Gene)
admin.site.register(Exon)
admin.site.register(Read)
admin.site.register(Result)
admin.site.register(Transcript)