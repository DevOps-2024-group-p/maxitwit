## how to render docs

### dependencies

```bash
sudo apt install pandoc

npm install --global mermaid-filter

sudo apt-get install texlive-latex-base

sudo apt-get install texlive-fonts-recommended

sudo apt-get install texlive-fonts-extra

sudo apt-get install texlive-latex-extra
```

- pandoc
- some pdf latex engine
- [mermaid filter](https://github.com/raghur/mermaid-filter)

```bash
cd report
andoc -s -o report.pdf --pdf-engine=pdflatex --filter mermaid-filter ./report.md
```
