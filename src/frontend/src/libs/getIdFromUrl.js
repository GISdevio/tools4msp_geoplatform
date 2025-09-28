// TODO: remove this when api shows the id
export default function getIdFromUrl(url, index_from_end = 0) {
  if (!url || typeof url !== "string") {
    console.warn("getIdFromUrl called with invalid URL:", url);
    return "";
  }

  let paths = url.split("/").filter((_) => _);
  return paths[paths.length - 1 - index_from_end] || "";
}
