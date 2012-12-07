truthScoreWithExonCount = dlmread('truthScoreWithExonCount.csv');
aggregated = [0 0];
for i = 2:max(truthScoreWithExonCount(:,2))
    indexes = truthScoreWithExonCount(:,2) == i;
    aggregated(i,:) = [mean(truthScoreWithExonCount(indexes,1)), i];
end

%% Precision
truthScoreWithExonCount = dlmread('truthPrecisionWithExonCount.csv');
aggregated = [0 0];
for i = 2:max(truthScoreWithExonCount(:,2))
    indexes = truthScoreWithExonCount(:,2) == i;
    aggregated(i,:) = [mean(truthScoreWithExonCount(indexes,1)), i];
end
bar(aggregated(:,2), aggregated(:,1))

%% Recall
truthScoreWithExonCount = dlmread('truthRecallWithExonCount.csv');
aggregated = [0 0];
for i = 2:max(truthScoreWithExonCount(:,2))
    indexes = truthScoreWithExonCount(:,2) == i;
    aggregated(i,:) = [mean(truthScoreWithExonCount(indexes,1)), i];
end
bar(aggregated(:,2), aggregated(:,1))

%% Score - all versions
truthScoreWithExonCount = dlmread('scoreWithExonCount.csv');
aggregated = [0 0];
for i = 2:max(truthScoreWithExonCount(:,2))
    indexes = truthScoreWithExonCount(:,2) == i;
    aggregated(i,:) = [mean(truthScoreWithExonCount(indexes,1)), i];
end
bar(aggregated(:,2), aggregated(:,1))

%% Score - version 1.0.0
truthScoreWithExonCount = dlmread('scoreWithExonCount_version1.0.0.csv');
aggregated = [0 0];
for i = 2:max(truthScoreWithExonCount(:,2))
    indexes = truthScoreWithExonCount(:,2) == i;
    aggregated(i,:) = [mean(truthScoreWithExonCount(indexes,1)), i];
end
bar(aggregated(:,2), aggregated(:,1))

%% Score - version 1.1.0
truthScoreWithExonCount = dlmread('scoreWithExonCount_version1.1.0.csv');
aggregated = [0 0];
for i = 2:max(truthScoreWithExonCount(:,2))
    indexes = truthScoreWithExonCount(:,2) == i;
    aggregated(i,:) = [mean(truthScoreWithExonCount(indexes,1)), i];
end
bar(aggregated(:,2), aggregated(:,1))

%% Score - version count
truthScoreWithExonCount = dlmread('scoreWithExonCount_version1.1.0.csv');
aggregated = [0 0];
for i = 2:max(truthScoreWithExonCount(:,2))
    indexes = truthScoreWithExonCount(:,2) == i;
    aggregated(i,:) = [length(find(truthScoreWithExonCount(indexes,1))), i];
end
bar(aggregated(:,2), aggregated(:,1))

%% Precision stacked hist
truthScoreWithExonCount = dlmread('truthPrecisionWithExonCount.csv');

minScore = min(truthScoreWithExonCount(:,1));
maxScore = max(truthScoreWithExonCount(:,1));
histBins = linSpace(minScore, maxScore, 10);
legendCell = {1, 17};

for i = 2:max(truthScoreWithExonCount(:,2))
    indexes = truthScoreWithExonCount(:,2) == i;
    selected = truthScoreWithExonCount(indexes,1);
    selected_hist = hist(selected, histBins)';
    
    legendCell{i - 1} = [num2str(i) '-exon gene'];
    
    if i == 2
        aggregated = selected_hist;
    else
        aggregated = [aggregated selected_hist];
    end
end

C=[[250 235 0]; [128 62 117]; [0 255 255]; [127 255 212]; ...
    [245 245 220]; [0 0 255]; [138 43 226]; [165 42 42]; ...
    [222 184 135]; [95 158 160]; [127 255 0]; [210 105 30];...
    [255 127 80]; [100 149 237]; [220 20 60]; [0 255 255];
    [0 0 139]; [0 139 139]]/255; % make a colors list

colormap(C);
bar(histBins, aggregated, 'stacked');
set(gca, 'XTick', floor(histBins * 100)/100);

% P=findobj(gca,'type','patch');

% for n=1:length(P)
% set(P(n),'FaceColor',C(n,:));
% set(P(n),'EdgeColor',C(n,:))
% end

set(gca, 'FontSize', 22);
legendObj = legend(legendCell);
set(legendObj, 'FontSize', 17)
xlabel('Precision')
ylabel('Number of results')

%% Recall stacked hist
truthScoreWithExonCount = dlmread('truthRecallWithExonCount.csv');

minScore = min(truthScoreWithExonCount(:,1));
maxScore = max(truthScoreWithExonCount(:,1));
histBins = linSpace(minScore, maxScore, 10);
legendCell = {1, 17};

for i = 2:max(truthScoreWithExonCount(:,2))
    indexes = truthScoreWithExonCount(:,2) == i;
    selected = truthScoreWithExonCount(indexes,1);
    selected_hist = hist(selected, histBins)';
    
    legendCell{i - 1} = [num2str(i) '-exon gene'];
    
    if i == 2
        aggregated = selected_hist;
    else
        aggregated = [aggregated selected_hist];
    end
end

C=[[250 235 0]; [128 62 117]; [0 255 255]; [127 255 212]; ...
    [245 245 220]; [0 0 255]; [138 43 226]; [165 42 42]; ...
    [222 184 135]; [95 158 160]; [127 255 0]; [210 105 30];...
    [255 127 80]; [100 149 237]; [220 20 60]; [0 255 255];
    [0 0 139]; [0 139 139]]/255; % make a colors list

colormap(C);
bar(histBins, aggregated, 'stacked');
set(gca, 'XTick', floor(histBins * 100)/100);

% P=findobj(gca,'type','patch');

% for n=1:length(P)
% set(P(n),'FaceColor',C(n,:));
% set(P(n),'EdgeColor',C(n,:))
% end

set(gca, 'FontSize', 22);
legendObj = legend(legendCell);
set(legendObj, 'FontSize', 17)
xlabel('Recall')
ylabel('Number of results')

%% Accuracy stacked hist
truthScoreWithExonCount = dlmread('truthScoreWithExonCount.csv');

minScore = min(truthScoreWithExonCount(:,1));
maxScore = max(truthScoreWithExonCount(:,1));
histBins = linSpace(minScore, maxScore, 10);
legendCell = {1, 17};

for i = 2:max(truthScoreWithExonCount(:,2))
    indexes = truthScoreWithExonCount(:,2) == i;
    selected = truthScoreWithExonCount(indexes,1);
    selected_hist = hist(selected, histBins)';
    
    legendCell{i - 1} = [num2str(i) '-exon gene'];
    
    if i == 2
        aggregated = selected_hist;
    else
        aggregated = [aggregated selected_hist];
    end
end

C=[[250 235 0]; [128 62 117]; [0 255 255]; [127 255 212]; ...
    [245 245 220]; [0 0 255]; [138 43 226]; [165 42 42]; ...
    [222 184 135]; [95 158 160]; [127 255 0]; [210 105 30];...
    [255 127 80]; [100 149 237]; [220 20 60]; [0 255 255];
    [0 0 139]; [0 139 139]]/255; % make a colors list

colormap(C);
bar(histBins, aggregated, 'stacked');
set(gca, 'XTick', floor(histBins * 100)/100);

% P=findobj(gca,'type','patch');

% for n=1:length(P)
% set(P(n),'FaceColor',C(n,:));
% set(P(n),'EdgeColor',C(n,:))
% end

set(gca, 'FontSize', 22);
legendObj = legend(legendCell);
set(legendObj, 'FontSize', 17)
xlabel('Expression Accuracy')
ylabel('Number of results')

