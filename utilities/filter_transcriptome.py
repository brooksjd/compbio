import string, sys

# gene_count = 617
# transcript_count = 1293

def getOverlap(a, b):
    return not (a[1] <= b[0] or b[1] <= a[0])

def very_different_lengths(a, b):
    threshold = 0.9
    
    len_a = a[1] - a[0]
    len_b = b[1] - b[0]
    
    ratio = abs(float(len_a)/len_b)
#    print 'ratio: ' + str(ratio) + ' : ' + str([a, b]) + ' : ' + str([len_a, len_b])
    
    if ratio < threshold or ratio > 1/threshold:
        return True
    else:
        return False

def well_behaved_transcripts(transcript_regions):
    # Well-behaved = no intron skipping, same exons don't have widely varying lengths, 
    # every transcript must differ in, at least, exon configuration
    transcripts = transcript_regions.values()
    for i, transcript in enumerate(transcripts):
        for j, test_transcript in enumerate(transcripts):
            if i==j:
                continue
            overall_overlap_count = 0
            for exon in transcript:                
                overlap_count = 0
                for test_exon in test_transcript:
                    #if transcript_regions.keys()[0] == ' transcript_id "MTR060710.1.27.0"': print str(exon) + " " + str(test_exon) + " " + str(getOverlap(exon, test_exon)) 
                    if getOverlap(exon, test_exon):
                        if very_different_lengths(exon, test_exon):
                            return False
                        overlap_count += 1
                        if overlap_count > 1:
                            return False
                overall_overlap_count += overlap_count 
            if overall_overlap_count == len(transcript) and len(transcript) == len(test_transcript): 
                # Number of overlaps was equal to number of exons in both transcripts meaning they have the
                # same exons 
                return False                           
          
    #if transcript_regions.keys()[0] == ' transcript_id "MTR060710.1.27.0"': sys.exit()        
    return True

def slicedict(d, s):
    return {k:v for k,v in d.iteritems() if k.startswith(s)}

def main():
    transcriptome_file = open(sys.argv[1])
    gene_count = 0
    transcript_count = 0
    
    last_gene = ''
    transcript_regions = {}
    
    genes = set()
    allowed_genes = {}
    
    for line in transcriptome_file:   
        # print line
        tokens = line.split('\t')
        
        feature = tokens[2]
        cur_region = [int(tokens[3]), int(tokens[4])]
        if (feature != 'exon'):
            continue
                
        desc = tokens[8]
        tokens = desc.split(';')
        
        gene_id = tokens[0].strip()
        gene_id = gene_id.strip()[9:len(gene_id) - 1]
        transcript_id = tokens[1].strip()
        transcript_id = transcript_id[15:len(transcript_id) - 1]
        
#        print gene_id + ' : ' + transcript_id
        
        transcript_regions.setdefault(transcript_id, []).append(cur_region)
        genes.add(gene_id)
        
    #print transcript_regions
    for gene in genes:
        gene_transcripts = slicedict(transcript_regions, gene)
        if len(gene_transcripts) > 1 and well_behaved_transcripts(gene_transcripts):
            allowed_genes[gene] = 1
    
    transcriptome_file = open(sys.argv[1])        
    for line in transcriptome_file:
        tokens = line.split('\t')
        
        feature = tokens[2]
        if (feature != 'exon'):
            continue
        
        desc = tokens[8]
        tokens = desc.split(';')        
        gene_id = tokens[0][9:len(tokens[0]) - 1]
        
        try:
            _ = allowed_genes[gene_id]
            print line.rstrip()
        except KeyError:
            pass

main()