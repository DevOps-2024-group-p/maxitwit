## how to render docs

### dependencies

- pandoc
- some pdf latex engine
- [mermaid filter](https://github.com/raghur/mermaid-filter)

```bash
cd report
pandoc -s -o ./build/report.pdf --pdf-engine=pdflatex --F mermaid-filter ./report.md
```