
# NFT COLLECTION GENERATOR
This tool generates generative NFT collection, based of all available traits.  
It was made with the intention to make the generative art field more accessible to anyone.  
With this tool you don't need to be a programmer to create generative art.

<img src="https://github.com/formysister/nft-generator/blob/main/screenshot/screenshot.png?raw=true" width="100%" />

**Features:**
* Generate Images of an infinite amount of traits
* Weight traits for different rarities
* Remove duplicated combinations
* Generate metadata for direct use on marketplaces

**Installation**
`npm install -g nft-collection-generator`

**Argument Description**
- `-b` Background image directory. Folder must include images that will be used for background of each collection. e.g: `-b traits/bg`
- `-t` Traits directory. Folder must include include sub folders that includes traits images. e.g: `-t traits`
- `-l` Layer(Traits) priority. List of trait folders in traits directory; They must be ordered by correct priority for precise image generation. e.g: `-l head body leg footer`
- `-n` Collection name e.g: `-n MyCollection`
- `-c` Generation amount e.g: `-c 2000`

**Example Usage**
`nft-gen -b traits/bg -t traits -l head body leg foot -c 2000 -n MyCollection` 

**Documentation**  

You should run the CLI, in the root directory of project.
Before you start, make sure your file structure looks something like this:

```
YOUR_PROJECT/  
├─ traits/  
│  ├─ trait1_name/  
│  │  ├─ file1.png  
│  │  ├─ file2.png  
│  │  ├─ file3.png  
│  │  ├─ ...  
│  ├─ trait2_name/  
│  │  ├─ file4.png  
│  │  ├─ file5.png  
│  │  ├─ ...  
│  ├─ trait3_name/  
│  │  ├─ file6.png  
│  │  ├─ ...  
│  ├─ ... 
|  ├─ bg/ 
│  │  ├─ background_image1.png
│  │  ├─ background_image2.png
│  │  ├─ ...  
```
**Command Example**
`nft-gen -b traits/bg -t traits -l trait1_name trait2_name trait3_name -c 2000 -n MyCollection`

This is really important, since the scripts imports the traits based on the folder structure.