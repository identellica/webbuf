# Normalize prerender output to the existing static-host contract.
def main [] {
  cp --force build/client/404/index.html build/client/404.html
  # RR requests /docs.data for /docs and /docs/_.data for /docs/.
  # Keep both URL spellings static; CloudFront passes .data through unchanged.
  let root = ('build/client' | path expand)
  for data in (glob build/client/**/_.data) {
    let directory = ($data | path dirname)
    if $directory != $root { cp --force $data ($directory + '.data') }
  }
}
