from django.conf.urls.defaults import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'transcriptome.transcriptomeapp.views.home', name='home'),
)
