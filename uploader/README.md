# IPFS Uploader

This program allows users to create generative arts and upload them to IFPS with 2 lines of command. It also provides an additional feature to store the images and metadata in the database for future reference.

Special thanks to [Daniel from hashlips](https://github.com/HashLips/hashlips_art_engine) to create such an awesome hashlips art engine

## Create Generative Art

Follow instruction from [Daniel from hashlip](https://github.com/HashLips/hashlips_art_engine)

## Upload to IPFS

```bash
cd src
ts-node index.ts
```

The command line will perform the following tasks

- Copy folder from the art engine
- Upload all images to IPFS
- Rename the image path in json files
- Upload metadata to IPFS
- Save to database (optionally)
