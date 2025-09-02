# 🧪 Teste da API de Upload

## 📋 **Como Testar**

### **1. Pré-requisitos**
- Backend rodando na porta 3001
- Usuário autenticado com token válido
- Postman ou curl instalado

### **2. Teste de Upload**

#### **Passo 1: Fazer Login**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fortuna.com",
    "password": "sua_senha"
  }'
```

#### **Passo 2: Fazer Upload de Imagem**
```bash
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "image=@caminho/para/sua/imagem.jpg"
```

#### **Passo 3: Verificar Imagem**
```
http://localhost:3001/uploads/NOME_DA_IMAGEM_GERADO.jpg
```

### **3. Teste com Postman**

#### **Collection: Upload de Imagem**
1. **Método**: POST
2. **URL**: `http://localhost:3001/api/upload/image`
3. **Headers**: 
   - `Authorization`: `Bearer SEU_TOKEN`
4. **Body**: 
   - `form-data`
   - `image`: [selecionar arquivo]

### **4. Verificações**

#### **✅ Sucesso**
- Arquivo salvo na pasta `back/uploads/`
- Nome único gerado (timestamp_uuid.extensão)
- Resposta com dados do arquivo

#### **❌ Erros Comuns**
- **401**: Token inválido ou expirado
- **400**: Arquivo não enviado
- **413**: Arquivo muito grande (>5MB)
- **400**: Tipo de arquivo não suportado

## 🔍 **Debugging**

### **1. Verificar Logs do Servidor**
```bash
# No terminal do backend
npm run dev
```

### **2. Verificar Pasta de Uploads**
```bash
# Verificar se a pasta foi criada
ls -la back/uploads/
```

### **3. Verificar Permissões**
```bash
# Verificar permissões da pasta
chmod 755 back/uploads/
```

## 📸 **Exemplo de Uso Completo**

### **1. Script de Teste**
```bash
#!/bin/bash

# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fortuna.com","password":"sua_senha"}' | \
  jq -r '.token')

echo "Token obtido: $TOKEN"

# 2. Upload
RESPONSE=$(curl -s -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@teste.jpg")

echo "Resposta do upload: $RESPONSE"

# 3. Extrair nome do arquivo
FILENAME=$(echo $RESPONSE | jq -r '.data.filename')
echo "Nome do arquivo: $FILENAME"

# 4. Verificar se existe
curl -s -I "http://localhost:3001/uploads/$FILENAME"
```

### **2. Teste de Validação**

#### **Arquivo Inválido (não é imagem)**
```bash
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@arquivo.txt"
```

#### **Arquivo Muito Grande**
```bash
# Criar arquivo grande para teste
dd if=/dev/zero of=grande.jpg bs=1M count=10

curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@grande.jpg"
```

## 🎯 **Resultados Esperados**

### **1. Upload Bem-sucedido**
- ✅ Arquivo salvo com nome único
- ✅ Resposta JSON com dados do arquivo
- ✅ Imagem acessível via URL
- ✅ Pasta `uploads/` criada automaticamente

### **2. Tratamento de Erros**
- ✅ Validação de tipo de arquivo
- ✅ Validação de tamanho
- ✅ Autenticação obrigatória
- ✅ Mensagens de erro claras

### **3. Segurança**
- ✅ Apenas usuários autenticados fazem upload
- ✅ Validação MIME type
- ✅ Nomes de arquivo seguros
- ✅ Pasta isolada do código

## 🚀 **Próximos Passos**

Após testar com sucesso:

1. **Integrar no frontend** ✅
2. **Testar com diferentes tipos de imagem**
3. **Verificar performance com arquivos grandes**
4. **Implementar limpeza automática de arquivos antigos**
5. **Configurar backup da pasta uploads/**

---

**🎉 API de Upload funcionando perfeitamente!** 🚀📸
