const searchBar = document.querySelector("#searchBar");
const searchBtn = document.querySelector("#searchBtn");

const itemListContainer = document.querySelector(".item-list-container");
const searchedValue = document.querySelector(".searched-value");
const searchedResults = document.querySelector(".searched-results");
const filterBtns = document.querySelectorAll(".filter-btn");
const loader = document.querySelector(".loader");

let pagination = {};

const fetchData = async (newOffset) => {
  const searchValue = searchBar.value;
  const filter = document.querySelector(".filter-btn.active").value;
  const offset = newOffset ? newOffset : 0; 

  loader.classList.add("show");
  try {
    let resource = filter ? `${filter}/` : "gifs/"; 
    let endpoint = searchValue ? `search?q=${searchValue}` : "trending?";

    const URL = `https://api.giphy.com/v1/${resource}${endpoint}&api_key=bO7jKdotzepJZpllrQIeMAcCsUEd9N1W&limit=10&offset=${offset}&rating=g&lang=en&bundle=messaging_non_clips`
    const response = await fetch(URL);
    const data = await response.json();

    if(offset === 0) { 
      pagination = data.pagination; 
      displayData(data, {clean:true});
    } else {
      displayData(data, {clean:false});
    }
  } catch (error) {
    console.log(error)
  } finally {
    loader.classList.remove("show");
  }
}

const searchByQuery = async (e) => {
  const searchValue = searchBar.value; 
  if(e.key === "Enter" || e.type === "click" && searchValue.length >= 1) {
    fetchData();
  }
}
searchBar.addEventListener("keypress", searchByQuery);
searchBtn.addEventListener("click", searchByQuery);


const displayData = (data, {clean = true}) => { 
  if(clean) { 
    itemListContainer.innerHTML = "";
  }

  data.data.forEach(element => {
    const itemCard = document.createElement("div")
    itemCard.classList.add("item-card");

    const itemImg = document.createElement("img");
    itemImg.setAttribute("src", element.images.original.url);
    itemImg.setAttribute("alt", element.title);
    itemImg.setAttribute("loading", "lazy");
    itemImg.classList.add("item-img")
    if(element.type === "sticker") {
      itemImg.classList.add("bg-sticker")
    } else {
      itemImg.style.backgroundColor = pickBgColor();
      itemImg.addEventListener("load", () => {
        itemImg.style.backgroundColor = "initial";
      })
    }

    const imgHeight = element.images.original.height;
    const imgWidth = element.images.original.width;
    if(imgHeight * 2 < imgWidth) {
      itemCard.classList.add("item-grid-row-1");
    }
    if(imgHeight >= 430 && imgHeight > imgWidth || imgHeight >= 430 && imgHeight === imgWidth) { 
      itemCard.classList.add("item-grid-row-3");
    }
    if(imgHeight >= 480 && imgHeight > imgWidth) { 
      itemCard.classList.add("item-grid-row-4");
    }

    const itemLink = document.createElement("a");
    itemLink.setAttribute("href", element.url);
    const linkIcon = document.createElement("i");
    linkIcon.classList.add("fi");
    linkIcon.classList.add("fi-br-link-alt");
    itemLink.appendChild(linkIcon);
    
    const itemInfo = document.createElement("div");
    itemInfo.classList.add("info");
    if(element?.user?.avatar_url) {
      const avatar = document.createElement("img");
      avatar.setAttribute("src", element?.user?.avatar_url);
      itemInfo.appendChild(avatar);
    }
    if(element?.user?.display_name) {
      const title = document.createElement("h6");
      title.innerText = element?.user?.display_name; 
      itemInfo.appendChild(title);
    }
    if(element.user?.is_verified) { 
      const verifiedIcon = document.createElement("i");
      verifiedIcon.classList.add("fi");
      verifiedIcon.classList.add("fi-br-check-circle")
      itemInfo.appendChild(verifiedIcon);
    }

    itemCard.appendChild(itemImg);
    itemCard.appendChild(itemLink);
    itemCard.appendChild(itemInfo);
    
    itemListContainer.appendChild(itemCard);
  });

  const searchValue = searchBar.value;
  searchedValue.innerText = searchValue ? searchValue : "Trending";
  const itemsCount = document.querySelectorAll(".item-card").length;
  searchedResults.innerText = `${itemsCount} results of ${data.pagination.total_count}`;
}

filterBtns.forEach(btnClicked => {
  btnClicked.addEventListener("click", async () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btnClicked.classList.add("active");
    fetchData();
  })
});

const loadMore = () => {
  const {
    scrollTop,
    scrollHeight,
    clientHeight
  } = document.documentElement;
  const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);

  const { count, offset, total_count } = pagination;
  if(offset < total_count && scrollIsBottom) {
    const newOffset = offset + count;
    pagination.offset = newOffset;
    fetchData(newOffset); 
  }
}
window.addEventListener("scroll", loadMore);

const pickBgColor = () => {
  const colors = [
    "#0cf", 
    "#0f9", 
    "#93f",
    "#f66", 
    "#fff35c", 
    "#00e6cc",
    "#3191ff",
    "#6157ff",
    "#e646b6", 
  ];
  const random = Math.floor(Math.random() * colors.length);
  return colors[random];
}

fetchData();

