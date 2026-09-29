# Vitória Nunes Silveira — site pessoal

Landing page em HTML, CSS e JavaScript, com conteúdo baseado no currículo de Vitória.

## Rodar localmente

```bash
python3 -m http.server 8000 --directory dist
```

Abra `http://localhost:8000`. Não há dependências ou etapa de compilação.

Para desenvolver com atualização automática no navegador:

```bash
npm install
npm run dev
```

O Vite é usado apenas no desenvolvimento; a versão publicada continua sendo HTML, CSS e JavaScript estáticos.

## Estrutura

- `dist/index.html`: conteúdo e estrutura semântica.
- `dist/styles.css`: visual, responsividade e estados de movimento reduzido.
- `dist/script.js`: menu móvel, títulos interativos, expansão das imagens na rolagem, cursor e ano do rodapé.
- `dist/curriculo-vitoria-nunes-silveira.pdf`: currículo disponível para download.
- `dist/registro-em-equipe.jpg` e `dist/smartpulse-preview.png`: imagens do acervo da Vitória.

O site pode ser hospedado como arquivos estáticos. Para atualizar dados profissionais, edite `dist/index.html` e substitua o PDF pelo currículo mais recente.


O SmartPulse apresenta quatro capítulos em rosa, azul, roxo e amarelo. A rolagem troca os capítulos; os botões numerados também permitem selecioná-los. Todos os cursos complementares são do SENAI.
