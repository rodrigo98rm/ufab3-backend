export const regexTicker = (produto: string | undefined): string => {
  if (!produto) return "";

  const regex = /^[A-Za-z0-9]+/;
  const match = produto.trim().match(regex);
  if (match) {
    const ticker = match[0];
    return ticker;
  } else {
    console.log("Não foi possivel recuperar o ticker");
    return "";
  }
};

export const regexProduto = (produto: string | undefined): string => {
  if (!produto) return "";

  const regex = /^[A-Za-z0-9]+ - (.*)$/;
  const match = produto.trim().match(regex);

  if (match) {
    const empresaNome = match[1].trim();
    return empresaNome;
  } else {
    console.log("Não foi possível extrair o nome da empresa.");
    return " ";
  }
};
