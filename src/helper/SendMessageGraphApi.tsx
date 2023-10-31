async function SendMessage(
  endpoint: string,
  messageBody: string,
  accessToken: string
): Promise<any> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: {
          content: messageBody,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `SendMessage: Network response was not ok. Status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export default SendMessage;
