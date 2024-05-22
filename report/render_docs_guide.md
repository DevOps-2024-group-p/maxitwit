# How to render docs

## Install dependencies

```bash
sudo apt install pandoc

npm install --global mermaid-filter

sudo apt-get install texlive-latex-base

sudo apt-get install texlive-fonts-recommended

sudo apt-get install texlive-fonts-extra

sudo apt-get install texlive-latex-extra
```

## Create .pdf

```bash
cd report

pandoc -s -N -o report.pdf \
-V colorlinks=true \
-V linkcolor=blue \
-V urlcolor=blue \
--pdf-engine=pdflatex \
--filter mermaid-filter \
./report.md
```
