import generator from "generate-password";

export const generatePassword = () => {
  const password = generator.generate({
    length: 12,
    numbers: true,
    symbols: true,
    uppercase: true,
    excludeSimilarCharacters: true,
  });

  return password;
};
