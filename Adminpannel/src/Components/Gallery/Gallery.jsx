import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiImage,
  FiFolder,
  FiEye,
  FiTrash2,
  FiEdit3,
  FiSearch,
  FiUploadCloud,
  FiPlus,
  FiSave,
  FiX,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiGrid,
} from "react-icons/fi";

import "./Gallery.css";

const Gallery = () => {
  const fileInputRef = useRef(null);

  /*
   * Keep track of locally created Blob URLs.
   * We do NOT revoke a URL immediately after saving because
   * the gallery still needs that URL.
   */
  const blobUrlsRef = useRef(new Set());

  /* =====================================================
     FALLBACK IMAGE
  ===================================================== */

  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85";

  /* =====================================================
     DUMMY DATA
  ===================================================== */

  const [galleryItems, setGalleryItems] = useState([
    {
      id: 1,
      title: "School Library",
      category: "Infrastructure",
      image:
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "12 Oct 2024",
      time: "10:30 AM",
      size: "2.4 MB",
    },
    {
      id: 2,
      title: "Annual Cultural Day",
      category: "Events",
      image:
        "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "10 Oct 2024",
      time: "04:20 PM",
      size: "1.8 MB",
    },
    {
      id: 3,
      title: "School Building",
      category: "Infrastructure",
      image:
        "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "08 Oct 2024",
      time: "11:15 AM",
      size: "3.1 MB",
    },
    {
      id: 4,
      title: "Classroom Activities",
      category: "Academics",
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "06 Oct 2024",
      time: "09:45 AM",
      size: "2.1 MB",
    },
    {
      id: 5,
      title: "Sports Day",
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "05 Oct 2024",
      time: "02:10 PM",
      size: "1.9 MB",
    },
    {
      id: 6,
      title: "Science Exhibition",
      category: "Academics",
      image:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "03 Oct 2024",
      time: "12:25 PM",
      size: "2.7 MB",
    },
    {
      id: 7,
      title: "Teachers Meeting",
      category: "Events",
      image:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "01 Oct 2024",
      time: "03:40 PM",
      size: "2.2 MB",
    },
    {
      id: 8,
      title: "Computer Lab",
      category: "Infrastructure",
      image:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "29 Sep 2024",
      time: "10:15 AM",
      size: "2.8 MB",
    },
    {
      id: 9,
      title: "Art Competition",
      category: "Events",
      image:
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "27 Sep 2024",
      time: "01:50 PM",
      size: "2.0 MB",
    },
    {
      id: 10,
      title: "Morning Assembly",
      category: "Activities",
      image:
        "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "25 Sep 2024",
      time: "08:30 AM",
      size: "1.7 MB",
    },
    {
      id: 11,
      title: "School Playground",
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "23 Sep 2024",
      time: "04:15 PM",
      size: "2.5 MB",
    },
    {
      id: 12,
      title: "Library Reading Session",
      category: "Academics",
      image:
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=85",
      uploadedOn: "20 Sep 2024",
      time: "11:30 AM",
      size: "2.3 MB",
    },
  ]);

  const categories = [
    "Infrastructure",
    "Events",
    "Academics",
    "Sports",
    "Activities",
  ];

  /* =====================================================
     FORM
  ===================================================== */

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  /* =====================================================
     FILTER
  ===================================================== */

  const [searchTerm, setSearchTerm] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [sortOrder, setSortOrder] =
    useState("Newest First");

  /* =====================================================
     SELECT
  ===================================================== */

  const [selectedItems, setSelectedItems] =
    useState([]);

  const [currentPage, setCurrentPage] =
    useState(1);

  /* =====================================================
     MODALS
  ===================================================== */

  const [viewItem, setViewItem] =
    useState(null);

  const [editItem, setEditItem] =
    useState(null);

  const [deleteItem, setDeleteItem] =
    useState(null);

  /* =====================================================
     EDIT
  ===================================================== */

  const [editTitle, setEditTitle] =
    useState("");

  const [editCategory, setEditCategory] =
    useState("");

  const [editImage, setEditImage] =
    useState("");

  const [editFile, setEditFile] =
    useState(null);

  const ITEMS_PER_PAGE = 5;

  /* =====================================================
     IMAGE URL CREATOR
  ===================================================== */

  const createImageUrl = (file) => {
    const url = URL.createObjectURL(file);

    blobUrlsRef.current.add(url);

    return url;
  };

  /* =====================================================
     REVOKE URL
  ===================================================== */

  const revokeImageUrl = (url) => {
    if (
      url &&
      url.startsWith("blob:") &&
      blobUrlsRef.current.has(url)
    ) {
      URL.revokeObjectURL(url);

      blobUrlsRef.current.delete(url);
    }
  };

  /* =====================================================
     IMAGE ERROR HANDLER
  ===================================================== */

  const handleImageError = (event) => {
    if (
      event.currentTarget.src !== FALLBACK_IMAGE
    ) {
      event.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  /* =====================================================
     VALIDATE IMAGE
  ===================================================== */

  const validateFile = (file) => {
    if (!file) return false;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Image size must be less than 5MB."
      );

      return false;
    }

    return true;
  };

  /* =====================================================
     FILE CHANGE
  ===================================================== */

  const handleFileChange = (file) => {
    if (!validateFile(file)) return;

    if (previewUrl) {
      revokeImageUrl(previewUrl);
    }

    const newUrl = createImageUrl(file);

    setSelectedFile(file);
    setPreviewUrl(newUrl);
  };

  const handleInputFile = (event) => {
    const file =
      event.target.files?.[0];

    if (file) {
      handleFileChange(file);
    }
  };

  /* =====================================================
     DRAG DROP
  ===================================================== */

  const handleDrop = (event) => {
    event.preventDefault();

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter image title.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    if (!selectedFile || !previewUrl) {
      alert("Please upload an image.");
      return;
    }

    const now = new Date();

    const newItem = {
      id: Date.now(),

      title: title.trim(),

      category,

      /*
       * IMPORTANT:
       * Keep this Blob URL alive.
       * We do NOT revoke it here.
       */
      image: previewUrl,

      uploadedOn:
        now.toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ),

      time:
        now.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),

      size: `${(
        selectedFile.size /
        1024 /
        1024
      ).toFixed(1)} MB`,
    };

    setGalleryItems((previous) => [
      newItem,
      ...previous,
    ]);

    setTitle("");

    setCategory("");

    setSelectedFile(null);

    /*
     * IMPORTANT:
     * Don't revoke previewUrl here.
     * The gallery item is using it.
     */
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setCurrentPage(1);
  };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredItems = useMemo(() => {
    let result = [...galleryItems];

    if (searchTerm.trim()) {
      const search =
        searchTerm.toLowerCase();

      result = result.filter(
        (item) =>
          item.title
            .toLowerCase()
            .includes(search) ||
          item.category
            .toLowerCase()
            .includes(search)
      );
    }

    if (
      categoryFilter !==
      "All Categories"
    ) {
      result = result.filter(
        (item) =>
          item.category ===
          categoryFilter
      );
    }

    if (sortOrder === "Newest First") {
      result.sort(
        (a, b) => b.id - a.id
      );
    }

    if (sortOrder === "Oldest First") {
      result.sort(
        (a, b) => a.id - b.id
      );
    }

    if (sortOrder === "A - Z") {
      result.sort((a, b) =>
        a.title.localeCompare(
          b.title
        )
      );
    }

    if (sortOrder === "Z - A") {
      result.sort((a, b) =>
        b.title.localeCompare(
          a.title
        )
      );
    }

    return result;
  }, [
    galleryItems,
    searchTerm,
    categoryFilter,
    sortOrder,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredItems.length /
        ITEMS_PER_PAGE
    )
  );

  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;

  const currentItems =
    filteredItems.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  useEffect(() => {
    if (
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    categoryFilter,
    sortOrder,
  ]);

  /* =====================================================
     SELECT ALL
  ===================================================== */

  const currentPageIds =
    currentItems.map(
      (item) => item.id
    );

  const isAllSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every(
      (id) =>
        selectedItems.includes(id)
    );

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems(
        (previous) =>
          previous.filter(
            (id) =>
              !currentPageIds.includes(
                id
              )
          )
      );
    } else {
      setSelectedItems(
        (previous) => [
          ...new Set([
            ...previous,
            ...currentPageIds,
          ]),
        ]
      );
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(
      (previous) =>
        previous.includes(id)
          ? previous.filter(
              (itemId) =>
                itemId !== id
            )
          : [
              ...previous,
              id,
            ]
    );
  };

  /* =====================================================
     VIEW
  ===================================================== */

  const handleView = (item) => {
    setViewItem(item);
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = (item) => {
    setEditItem(item);

    setEditTitle(item.title);

    setEditCategory(
      item.category
    );

    setEditImage(item.image);

    setEditFile(null);
  };

  const handleEditFile = (event) => {
    const file =
      event.target.files?.[0];

    if (!validateFile(file)) return;

    if (
      editImage &&
      editImage.startsWith("blob:")
    ) {
      /*
       * Only revoke the old edit preview
       * if it was created specifically
       * during editing.
       */
    }

    const newUrl =
      createImageUrl(file);

    setEditFile(file);

    setEditImage(newUrl);
  };

  /* =====================================================
     UPDATE
  ===================================================== */

  const handleUpdate = () => {
    if (!editTitle.trim()) {
      alert(
        "Please enter image title."
      );
      return;
    }

    if (!editCategory) {
      alert(
        "Please select category."
      );
      return;
    }

    setGalleryItems(
      (previous) =>
        previous.map(
          (item) => {
            if (
              item.id !==
              editItem.id
            ) {
              return item;
            }

            const oldImage =
              item.image;

            /*
             * If a new image was selected,
             * replace the old image.
             */
            const updatedImage =
              editFile
                ? editImage
                : oldImage;

            /*
             * If old image was a blob,
             * revoke it because it is no
             * longer being used.
             */
            if (
              editFile &&
              oldImage.startsWith(
                "blob:"
              )
            ) {
              revokeImageUrl(
                oldImage
              );
            }

            return {
              ...item,

              title:
                editTitle.trim(),

              category:
                editCategory,

              image:
                updatedImage,

              size: editFile
                ? `${(
                    editFile.size /
                    1024 /
                    1024
                  ).toFixed(1)} MB`
                : item.size,
            };
          }
        )
    );

    setEditItem(null);

    setEditFile(null);

    setEditImage("");
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const confirmDelete = () => {
    if (!deleteItem) return;

    /*
     * Revoke local Blob URL when deleting.
     */
    if (
      deleteItem.image?.startsWith(
        "blob:"
      )
    ) {
      revokeImageUrl(
        deleteItem.image
      );
    }

    setGalleryItems(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !==
            deleteItem.id
        )
    );

    setSelectedItems(
      (previous) =>
        previous.filter(
          (id) =>
            id !== deleteItem.id
        )
    );

    setDeleteItem(null);
  };

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalImages =
    galleryItems.length;

  const totalFolders =
    new Set(
      galleryItems.map(
        (item) =>
          item.category
      )
    ).size;

  const totalViews = 12480;

  const unusedImages = 9;

  /* =====================================================
     ESC KEY
  ===================================================== */

  useEffect(() => {
    const handleEscape = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        setViewItem(null);
        setEditItem(null);
        setDeleteItem(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =====================================================
     CLEAN ALL BLOB URLS ON UNMOUNT
  ===================================================== */

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(
        (url) => {
          URL.revokeObjectURL(url);
        }
      );

      blobUrlsRef.current.clear();
    };
  }, []);

  /* =====================================================
     JSX
  ===================================================== */

  return (
    <div className="GalleryContainer">

      <div className="GalleryStats">

        <div className="GalleryStatCard">

          <div className="GalleryStatIcon GalleryStatBlue">
            <FiImage />
          </div>

          <div className="GalleryStatContent">

            <span>
              Total Images
            </span>

            <strong>
              {totalImages}
            </strong>

            <small className="GalleryGreenText">
              ↑ 12% this month
            </small>

          </div>

        </div>


        <div className="GalleryStatCard">

          <div className="GalleryStatIcon GalleryStatBlue">
            <FiFolder />
          </div>

          <div className="GalleryStatContent">

            <span>
              Gallery Folders
            </span>

            <strong>
              {totalFolders}
            </strong>

            <small className="GalleryGreenText">
              ↑ 18% this month
            </small>

          </div>

        </div>


        <div className="GalleryStatCard">

          <div className="GalleryStatIcon GalleryStatBlue">
            <FiEye />
          </div>

          <div className="GalleryStatContent">

            <span>
              Total Views
            </span>

            <strong>
              {totalViews.toLocaleString()}
            </strong>

            <small className="GalleryGreenText">
              ↑ 25% this month
            </small>

          </div>

        </div>


        <div className="GalleryStatCard">

          <div className="GalleryStatIcon GalleryStatRed">
            <FiTrash2 />
          </div>

          <div className="GalleryStatContent">

            <span>
              Unused Images
            </span>

            <strong>
              {unusedImages}
            </strong>

            <small className="GalleryRedText">
              ↓ 5% this month
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          ADD GALLERY
      ================================================= */}

      <div className="GalleryFormCard">

        <div className="GallerySectionHeader">

          <div className="GallerySectionTitle">

            <FiPlus />

            <h2>
              Add Gallery Image
            </h2>

          </div>

        </div>

        <div className="GalleryDivider" />


        <div className="GalleryFormGrid">

          {/* TITLE */}

          <div className="GalleryFormGroup">

            <label>
              Title <span>*</span>
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Enter image title (e.g. School Library, Annual Day, etc.)"
            />

          </div>


          {/* CATEGORY */}

          <div className="GalleryFormGroup">

            <label>
              Category <span>*</span>
            </label>

            <div className="GallerySelectWrapper">

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

              <FiChevronDown />

            </div>

          </div>


          {/* UPLOAD */}

          <div className="GalleryFormGroup GalleryUploadGroup">

            <label>
              Upload Image <span>*</span>
            </label>

            <div
              className="GalleryUploadBox"
              onClick={() =>
                fileInputRef.current?.click()
              }
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >

              {previewUrl ? (
                <div className="GalleryUploadPreview">

                  <img
                    src={previewUrl}
                    alt="Selected preview"
                    onError={
                      handleImageError
                    }
                  />

                  <div className="GalleryUploadOverlay">

                    <FiUploadCloud />

                    <span>
                      Change Image
                    </span>

                  </div>

                </div>
              ) : (
                <>

                  <FiUploadCloud />

                  <strong>
                    Click to upload or
                    drag and drop
                  </strong>

                  <span>
                    Supports: JPG, PNG,
                    JPEG, WEBP (Max 5MB)
                  </span>

                </>
              )}

            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={
                handleInputFile
              }
              hidden
            />

          </div>

        </div>


        <button
          type="button"
          className="GallerySaveButton"
          onClick={handleSave}
        >
          <FiSave />
          Save
        </button>

      </div>


      {/* =================================================
          GALLERY LIST
      ================================================= */}

      <div className="GalleryListCard">

        <div className="GalleryListHeader">

          <div className="GalleryListTitle">

            <div className="GalleryListIcon">
              <FiGrid />
            </div>

            <div>

              <h2>
                Gallery List
              </h2>

              <span>
                {filteredItems.length}
                {" "}
                images
              </span>

            </div>

          </div>


          <div className="GalleryFilters">

            <div className="GallerySearchBox">

              <FiSearch />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search by title..."
              />

            </div>


            <div className="GalleryFilterSelect">

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
              >

                <option>
                  All Categories
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

              <FiChevronDown />

            </div>


            <div className="GalleryFilterSelect">

              <select
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(
                    event.target.value
                  )
                }
              >

                <option>
                  Newest First
                </option>

                <option>
                  Oldest First
                </option>

                <option>
                  A - Z
                </option>

                <option>
                  Z - A
                </option>

              </select>

              <FiChevronDown />

            </div>

          </div>

        </div>


        {/* TABLE */}

        <div className="GalleryTableWrapper">

          <table className="GalleryTable">

            <thead>

              <tr>

                <th>
                  <input
                    type="checkbox"
                    checked={
                      isAllSelected
                    }
                    onChange={
                      handleSelectAll
                    }
                  />
                </th>

                <th>#</th>

                <th>Image</th>

                <th>Title</th>

                <th>Category</th>

                <th>
                  Uploaded On
                </th>

                <th>Size</th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {currentItems.length >
              0 ? (
                currentItems.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={
                        item.id
                      }
                    >

                      <td>

                        <input
                          type="checkbox"
                          checked={selectedItems.includes(
                            item.id
                          )}
                          onChange={() =>
                            handleSelectItem(
                              item.id
                            )
                          }
                        />

                      </td>


                      <td>
                        {startIndex +
                          index +
                          1}
                      </td>


                      <td>

                        <div className="GalleryTableImage">

                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.title
                            }
                            onError={
                              handleImageError
                            }
                          />

                        </div>

                      </td>


                      <td>

                        <strong className="GalleryTableTitle">
                          {
                            item.title
                          }
                        </strong>

                      </td>


                      <td>

                        <span
                          className={`GalleryCategoryBadge GalleryCategory${item.category.replace(
                            /\s/g,
                            ""
                          )}`}
                        >
                          {
                            item.category
                          }
                        </span>

                      </td>


                      <td>

                        <div className="GalleryDate">

                          <strong>
                            {
                              item.uploadedOn
                            }
                          </strong>

                          <span>
                            {
                              item.time
                            }
                          </span>

                        </div>

                      </td>


                      <td>

                        <span className="GallerySize">
                          {
                            item.size
                          }
                        </span>

                      </td>


                      <td>

                        <div className="GalleryActions">

                          <button
                            type="button"
                            className="GalleryActionButton GalleryViewButton"
                            title="View"
                            onClick={() =>
                              handleView(
                                item
                              )
                            }
                          >
                            <FiEye />
                          </button>


                          <button
                            type="button"
                            className="GalleryActionButton GalleryEditButton"
                            title="Edit"
                            onClick={() =>
                              handleEdit(
                                item
                              )
                            }
                          >
                            <FiEdit3 />
                          </button>


                          <button
                            type="button"
                            className="GalleryActionButton GalleryDeleteButton"
                            title="Delete"
                            onClick={() =>
                              handleDelete(
                                item
                              )
                            }
                          >
                            <FiTrash2 />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )
              ) : (

                <tr>

                  <td
                    colSpan="8"
                    className="GalleryEmptyState"
                  >

                    <div className="GalleryEmptyIcon">
                      <FiImage />
                    </div>

                    <h3>
                      No gallery images
                      found
                    </h3>

                    <p>
                      Add your first
                      gallery image
                      using the form
                      above.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div className="GalleryTableFooter">

          <span>
            Showing{" "}
            {filteredItems.length ===
            0
              ? 0
              : startIndex + 1}{" "}
            to{" "}
            {Math.min(
              startIndex +
                ITEMS_PER_PAGE,
              filteredItems.length
            )}{" "}
            of{" "}
            {
              filteredItems.length
            }{" "}
            images
          </span>


          <div className="GalleryPagination">

            <button
              type="button"
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (previous) =>
                    Math.max(
                      1,
                      previous - 1
                    )
                )
              }
            >
              <FiChevronLeft />
            </button>


            {Array.from(
              {
                length:
                  totalPages,
              },
              (_, index) =>
                index + 1
            ).map((page) => (

              <button
                type="button"
                key={page}
                className={
                  currentPage ===
                  page
                    ? "GalleryPageActive"
                    : ""
                }
                onClick={() =>
                  setCurrentPage(
                    page
                  )
                }
              >
                {page}
              </button>

            ))}


            <button
              type="button"
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (previous) =>
                    Math.min(
                      totalPages,
                      previous + 1
                    )
                )
              }
            >
              <FiChevronRight />
            </button>

          </div>

        </div>

      </div>


      {/* =================================================
          VIEW MODAL
      ================================================= */}

      {viewItem && (

        <div
          className="GalleryModalOverlay"
          onClick={() =>
            setViewItem(null)
          }
        >

          <div
            className="GalleryViewModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="GalleryModalHeader">

              <div>

                <span>
                  GALLERY IMAGE
                </span>

                <h2>
                  {
                    viewItem.title
                  }
                </h2>

              </div>


              <button
                type="button"
                className="GalleryCloseButton"
                onClick={() =>
                  setViewItem(
                    null
                  )
                }
              >
                <FiX />
              </button>

            </div>


            {/* IMAGE */}

            <div className="GalleryViewImage">

              <img
                src={
                  viewItem.image ||
                  FALLBACK_IMAGE
                }
                alt={
                  viewItem.title
                }
                onError={
                  handleImageError
                }
              />

            </div>


            {/* DETAILS */}

            <div className="GalleryViewDetails">

              <div>

                <span>
                  Title
                </span>

                <strong>
                  {
                    viewItem.title
                  }
                </strong>

              </div>


              <div>

                <span>
                  Category
                </span>

                <strong>
                  {
                    viewItem.category
                  }
                </strong>

              </div>


              <div>

                <span>
                  Uploaded On
                </span>

                <strong>
                  {
                    viewItem.uploadedOn
                  }
                </strong>

              </div>


              <div>

                <span>
                  Image Size
                </span>

                <strong>
                  {
                    viewItem.size
                  }
                </strong>

              </div>

            </div>


            {/* FOOTER */}

            <div className="GalleryModalFooter">

              <button
                type="button"
                className="GalleryModalSecondary"
                onClick={() =>
                  setViewItem(
                    null
                  )
                }
              >
                Close
              </button>


              <button
                type="button"
                className="GalleryModalPrimary"
                onClick={() => {

                  const item =
                    viewItem;

                  setViewItem(
                    null
                  );

                  handleEdit(
                    item
                  );

                }}
              >

                <FiEdit3 />

                Edit Image

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {editItem && (

        <div
          className="GalleryModalOverlay"
          onClick={() =>
            setEditItem(null)
          }
        >

          <div
            className="GalleryEditModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="GalleryModalHeader">

              <div>

                <span>
                  EDIT GALLERY
                </span>

                <h2>
                  Update Image
                </h2>

              </div>


              <button
                type="button"
                className="GalleryCloseButton"
                onClick={() =>
                  setEditItem(
                    null
                  )
                }
              >
                <FiX />
              </button>

            </div>


            <div className="GalleryEditBody">

              <div className="GalleryEditPreview">

                <img
                  src={
                    editImage ||
                    FALLBACK_IMAGE
                  }
                  alt={
                    editTitle
                  }
                  onError={
                    handleImageError
                  }
                />


                <label className="GalleryChangeImageButton">

                  <FiUploadCloud />

                  Change Image

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={
                      handleEditFile
                    }
                  />

                </label>

              </div>


              <div className="GalleryEditFields">

                <div className="GalleryFormGroup">

                  <label>
                    Image Title
                  </label>

                  <input
                    type="text"
                    value={
                      editTitle
                    }
                    onChange={(
                      event
                    ) =>
                      setEditTitle(
                        event
                          .target
                          .value
                      )
                    }
                  />

                </div>


                <div className="GalleryFormGroup">

                  <label>
                    Category
                  </label>

                  <div className="GallerySelectWrapper">

                    <select
                      value={
                        editCategory
                      }
                      onChange={(
                        event
                      ) =>
                        setEditCategory(
                          event
                            .target
                            .value
                        )
                      }
                    >

                      {categories.map(
                        (item) => (

                          <option
                            key={
                              item
                            }
                            value={
                              item
                            }
                          >
                            {
                              item
                            }
                          </option>

                        )
                      )}

                    </select>

                    <FiChevronDown />

                  </div>

                </div>

              </div>

            </div>


            <div className="GalleryModalFooter">

              <button
                type="button"
                className="GalleryModalSecondary"
                onClick={() =>
                  setEditItem(
                    null
                  )
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="GalleryModalPrimary"
                onClick={
                  handleUpdate
                }
              >

                <FiSave />

                Save Changes

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteItem && (

        <div
          className="GalleryModalOverlay"
          onClick={() =>
            setDeleteItem(
              null
            )
          }
        >

          <div
            className="GalleryDeleteModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="GalleryDeleteIcon">
              <FiAlertTriangle />
            </div>


            <h2>
              Delete Gallery Image?
            </h2>


            <p>
              Are you sure you want
              to delete{" "}
              <strong>
                "{deleteItem.title}"
              </strong>
              ? This action cannot
              be undone.
            </p>


            <div className="GalleryDeleteActions">

              <button
                type="button"
                className="GalleryModalSecondary"
                onClick={() =>
                  setDeleteItem(
                    null
                  )
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="GalleryConfirmDelete"
                onClick={
                  confirmDelete
                }
              >

                <FiTrash2 />

                Delete Image

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Gallery;