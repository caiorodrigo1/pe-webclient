/// <reference lib="webworker" />

addEventListener('message', async ({ data }) => {
  const { url, payloads, token } = data;

  for (const payload of payloads) {
    const { arquivo, metadata } = payload;

    const result = {
      nome: '',
      chaveArquivo: metadata.chaveArquivo,
      enviado: false,
    };

    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('metadata', JSON.stringify(metadata));
    try {
      const response = await fetch(`${url}/file-manager/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data } = await response.json();
      result.nome = data.nome;
      result.enviado = true;

      postMessage(result);
    } catch (error) {
      console.log('Worker error: ', error);
      postMessage(result);
    }
  }
});
