def main():
    expression_profile = open('mm9_hydrolysis.pro')
    
    expressed_count = 0
    line_count = 0
    for line in expression_profile:
        line_count += 1
        tokens = line.split('\t')
        
        if int(tokens[5]) != 0:
            expressed_count += 1
    
    print 'Expressed count: ' + str(expressed_count) + '/' + str(line_count)
    
main()