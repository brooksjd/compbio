from django.db import models
import logging, string, os

logger = logging.getLogger(__name__)

class Experiment(models.Model):
    description = models.CharField(max_length=200, unique=True)

class Gene(models.Model):
    name = models.CharField(max_length=200, unique=True)
    
class Exon(models.Model):
    gene = models.ForeignKey(Gene)
    start = models.IntegerField()
    end = models.IntegerField()
    
class Read(models.Model):
    readCount = models.IntegerField()
    exons = models.ManyToManyField(Exon)
    experiment = models.ForeignKey(Experiment)

#class SingleExonRead(models.Model):
#    readCount = models.IntegerField()
#    exon = models.ForeignKey(Exon)
#    experiment = models.ForeignKey(Experiment)
#        
#class JunctionRead(models.Model):
#    experiment = models.ForeignKey(Experiment)
#    exon1 = models.ForeignKey(Exon, related_name='junction_reads_1')
#    exon2 = models.ForeignKey(Exon, related_name='junction_reads_2')
#    count = models.IntegerField()
    
class Result(models.Model):
    gene = models.ForeignKey(Gene)
    experiment = models.ForeignKey(Experiment)
    
class Transcript(models.Model):
    result = models.ForeignKey(Result)
    expression = models.FloatField()
    exons = models.ManyToManyField(Exon)