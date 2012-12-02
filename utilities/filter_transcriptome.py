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

def main():
    transcriptome_file = open('transcriptome.gtf')
    gene_count = 0
    transcript_count = 0
    
    last_gene = ''
    transcripts = set()
    transcript_regions = {}
    for line in transcriptome_file:        
        tokens = line.split('\t')
        
        feature = tokens[2]
        cur_region = [int(tokens[3]), int(tokens[4])]
        if (feature != 'exon'):
            continue
        
        #print line.rstrip()
        
        desc = tokens[8]
        tokens = desc.split(';')
        
        if last_gene == tokens[0]:            
            transcripts.add(tokens[1])            
            transcript_regions.setdefault(tokens[1], []).append(cur_region)           
#            
#            if not has_overlap:
#                for region in regions:
#                    if getOverlap(region, cur_region):
#                        has_overlap = True
#                        break
#            
#            #print has_overlap
#            regions.append(cur_region)
        else:
            
            if len(transcripts) > 1 and well_behaved_transcripts(transcript_regions):
                #print transcript_regions
                gene_count += 1
                transcript_count += len(transcripts)
                for buffer_line in line_buffer:
                    print buffer_line
            
            transcripts = set()
            transcript_regions = {}
            line_buffer = []
            has_overlap = False
            
            last_gene = tokens[0]            
            transcripts.add(tokens[1])
            transcript_regions.setdefault(tokens[1], []).append(cur_region)
            regions = [cur_region]
            
        line_buffer.append(line.rstrip())
        
#        print 'gene_count: ' + str(gene_count)
#        print 'transcript_count: ' + str(transcript_count)
            
        #number_of_exons = tokens[2]
        
        #first_loc = string.find(number_of_exons, '"') + 1
        #number_of_exons = int(number_of_exons[first_loc:string.find(number_of_exons, '"', first_loc)])
        
        #if (number_of_exons > 1):
        #    print line.rstrip()

main()