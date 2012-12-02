def main():
    reads = open('mm9_hydrolysis.bed')
    count = 0
    
    for line in reads:
        count += 1
        
    print 'Count: ' + str(count)

main()