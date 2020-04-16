#!/bin/bash

#Download json data
for i in `seq 1 500`;
do
    echo $i
    wget "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=051d72238deaf8b3bbfd5330cf5b13c8&language=fr&page=$i" -O $i.txt
done 

#Download json parser
wget https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 -O jq
chmod a+x jq

# json to Text
for i in $(seq 1 500); do  cat $i.txt | ./jq '.results[].title' | sed 's/^"/Movie;/' | sed 's/"$//' >> ../Bank.txt ; done




