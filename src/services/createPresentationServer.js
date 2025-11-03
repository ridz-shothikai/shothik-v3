export async function createPresentationServer({ message, file_urls, token }) {
  const api = `${process.env.NEXT_PUBLIC_SLIDE_API_URL}/create-presentation`; // TODO: This needs to be redirected.
  /**
   * api return expected: 
   {
  "message": "string",
  "p_id": "string",
  "userId": "string",
  "file_urls": [
    "string"
    ]
  }
   */
  try {
    const res = await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, file_urls }),
    });

    const data = await res.json();

    console.log(data, "CREATE PRESENTATION RESPONSE");

    console.log("Create presentation response:", res.status, res.ok, res);

    if (!res.ok) {
      console.log(data.message || "Failed to create presentation");
    }

    return {
      success: true,
      presentationId:
        data?.presentationId || data?.presentation_id || data?.p_id,
    };
  } catch (err) {
    console.error("Server action failed:", err);
    return { success: false, error: err.message || "Something went wrong" };
  }
}
