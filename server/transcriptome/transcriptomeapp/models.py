from django.db import models
import logging, string, os

logger = logging.getLogger(__name__)

class Experiment(models.Model):
    description = models.CharField(max_length=200)

class Gene(models.Model):
    name = models.CharField(max_length=200)
    
class Exon(models.Model):
    name = models.CharField(max_length=50)
    length = models.IntegerField()    
    gene = models.ForeignKey(Gene)
    order = models.IntegerField()

class SingleExonRead(models.Model):
    readCount = models.IntegerField()
    exon = models.ForeignKey(Exon)
    experiment = models.ForeignKey(Experiment)
        
class JunctionRead(models.Model):
    experiment = models.ForeignKey(Experiment)
    exon1 = models.ForeignKey(Exon)
    exon2 = models.ForeignKey(Exon)
    count = models.IntegerField()
    
class Result(models.Model):
    gene = models.ForeignKey(Gene)
    experiment = models.ForeignKey(Experiment)
    
class Transcript(models.Model):
    result = models.ForeignKey(Result)
    expression = models.FloatField()
    exons = models.ManyToManyField(Exon)