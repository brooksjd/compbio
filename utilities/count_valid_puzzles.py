def main():
    annotation = open('re_filtered_transcriptome.gtf')
    
    genes = {}
    for line in annotation:
        tokens = line.split('\t')
        desc = tokens[8]
        desc_tokens = desc.split(';')
        
        cur_start = int(tokens[3])
        cur_end = int(tokens[4])
        
        gene = desc_tokens[0][9:len(desc_tokens[0]) - 1]
        existing_regions = genes.setdefault(gene, [])
        
        found_region = False
        for existing_region in existing_regions:
            if existing_region[1] > cur_start and existing_region[0] < cur_end:
                existing_region[1] = max(existing_region[1], cur_end)
                existing_region[0] = min(existing_region[0], cur_start)
                found_region = True
                
        if not found_region:
            existing_regions.append([cur_start, cur_end])
            
    reads = open('mm9_hydrolysis.bed')
    old_gene = ''
    valid_puzzle_count = 0
    mapped_exons = set()
    line_count = 0
    line_count_step = 100
    for line in reads:
        line_count += 1
#        if line_count % line_count_step == 0:
#            print 'Working on read line ' + str(line_count)

        tokens = line.split('\t')
        
        read_start = int(tokens[1])
        read_end = int(tokens[2])
        exon_count = int(tokens[9])
        
        gene = tokens[3].split(':')[2].split('.')[0]
        
        if gene != old_gene:            
            if old_gene != '' and len(genes[old_gene]) == len(mapped_exons):
                valid_puzzle_count += 1
                print old_gene
            old_gene = gene
            mapped_exons = set()
                            
        regions = genes[gene]
        
        found_count = 0
        for i, region in enumerate(regions):
            if region[1] > read_start and region[0] < read_end:
                mapped_exons.add(i)
                found_count += 1
                
                if found_count == exon_count:
                    break
                
    # print 'valid_puzzle_count: ' + str(valid_puzzle_count) + '/' + str(len(genes))
    
main()