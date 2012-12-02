from django.conf.urls.defaults import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'transcriptome.transcriptomeapp.views.home', name='home'),
    url(r'^get_puzzle', 'transcriptome.transcriptomeapp.views.get_puzzle', name='get_puzzle')
)
