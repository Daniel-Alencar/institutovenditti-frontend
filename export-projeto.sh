#!/bin/bash

# 🚀 Script de Exportação do Projeto
# Cria um ZIP pronto para hospedar em outro local

echo "🚀 Iniciando exportação do projeto..."
echo ""

# Nome do arquivo ZIP
OUTPUT_FILE="advocacia-digital-$(date +%Y%m%d-%H%M%S).zip"

# Verificar se o comando zip existe
if ! command -v zip &> /dev/null; then
    echo "❌ Erro: comando 'zip' não encontrado."
    echo "   Instale com: sudo apt-get install zip"
    exit 1
fi

# Criar arquivo ZIP excluindo pastas desnecessárias
echo "📦 Criando arquivo ZIP..."
zip -r "$OUTPUT_FILE" . \
    -x "node_modules/*" \
    -x "dist/*" \
    -x ".git/*" \
    -x "*.log" \
    -x ".DS_Store" \
    -x "export-projeto.sh"

# Verificar se foi criado com sucesso
if [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo ""
    echo "✅ Exportação concluída com sucesso!"
    echo ""
    echo "📋 Informações do arquivo:"
    echo "   Nome: $OUTPUT_FILE"
    echo "   Tamanho: $FILE_SIZE"
    echo ""
    echo "📂 Localização:"
    echo "   $(pwd)/$OUTPUT_FILE"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. Copie o arquivo ZIP para o novo local"
    echo "   2. Extraia o ZIP"
    echo "   3. Execute: npm install"
    echo "   4. Configure .env.local com sua senha"
    echo "   5. Execute: npm run dev"
    echo ""
    echo "📚 Consulte COMO_HOSPEDAR.md para instruções completas!"
else
    echo "❌ Erro ao criar arquivo ZIP"
    exit 1
fi
