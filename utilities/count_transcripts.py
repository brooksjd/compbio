def main():
    gtf_file = open('re_filtered_transcriptome.gtf')
    
    transcripts = set()
    genes = set()
    total_length = 0
    for line in gtf_file:
        tokens = line.split('\t')
        
        total_length += int(tokens[4]) - int(tokens[3])
        
        tokens = tokens[8].split(';')
        transcripts.add(tokens[1])
        genes.add(tokens[0])
        
    print 'Number of transcripts: ' + str(len(transcripts))
    print 'Number of genes: ' + str(len(genes))
    print 'Transcriptome length: ' + str(total_length)

main()