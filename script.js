document.addEventListener("DOMContentLoaded", () => {
  // --- DATA STRUCTURES ---

  /**
   * Represents a single book.
   */
  class Book {
    constructor(title, author) {
      this.id =
        "id_" +
        Date.now().toString() +
        Math.random().toString(36).substring(2, 9);
      this.title = title;
      this.author = author;
      this.status = "Available"; // 'Available' or 'Borrowed'
      this.history = new HistoryList(); // Each book gets its own history Linked List
      this.history.addEntry("Created");

      // Generate a placeholder cover image URL
      const titleShort = title.split(" ").slice(0, 3).join(" "); // Use first 3 words
      this.coverImage = `https://placehold.co/400x600/60a5fa/ffffff?text=${encodeURIComponent(
        titleShort
      )}`;
    }
  }

  // --- Linked List for Borrow History ---

  /**
   * Represents one entry in the history Linked List.
   */
  class HistoryNode {
    constructor(status) {
      this.status = status;
      this.timestamp = new Date();
      this.next = null;
    }
  }

  /**
   * The Linked List to store a book's history.
   */
  class HistoryList {
    constructor() {
      this.head = null;
      this.tail = null;
    }

    /**
     * Adds a new history entry to the end of the list.
     * @param {string} status - 'Borrowed', 'Returned', 'Created', 'Edited'
     */
    addEntry(status) {
      const newNode = new HistoryNode(status);
      if (this.head === null) {
        this.head = newNode;
        this.tail = newNode;
      } else {
        this.tail.next = newNode;
        this.tail = newNode;
      }
    }

    /**
     * Returns all history entries as an array (for display).
     * @returns {HistoryNode[]}
     */
    getEntries() {
      const entries = [];
      let currentNode = this.head;
      while (currentNode !== null) {
        entries.push(currentNode);
        currentNode = currentNode.next;
      }
      return entries.reverse(); // Show most recent first
    }
  }

  // --- Binary Search Tree for Library ---

  /**
   * Represents a node in the Binary Search Tree.
   */
  class BSTNode {
    constructor(book) {
      this.book = book;
      this.left = null;
      this.right = null;
    }
  }

  /**
   * The Binary Search Tree to store and manage all books.
   * The tree is sorted by book.title.
   */
  class BinarySearchTree {
    constructor() {
      this.root = null;
    }

    // --- Core Public Methods ---

    /**
     * Inserts a new book into the tree.
     * @param {Book} book - The book object to insert.
     */
    insert(book) {
      const newNode = new BSTNode(book);
      if (this.root === null) {
        this.root = newNode;
      } else {
        this._insertNode(this.root, newNode);
      }
    }

    /**
     * Deletes a book from the tree by its title.
     * @param {string} title - The title of the book to delete.
     */
    delete(title) {
      this.root = this._deleteNode(this.root, title.toLowerCase());
    }

    /**
     * Finds a book by its title.
     * @param {string} title - The title to search for.
     * @returns {Book | null} - The book object or null if not found.
     */
    searchByTitle(title) {
      return this._searchTitle(this.root, title.toLowerCase());
    }

    /**
     * Finds a book by its unique ID. (O(n) traversal)
     * @param {string} id - The ID to search for.
     * @returns {Book | null} - The book object or null if not found.
     */
    searchById(id) {
      const results = [];
      this._traverseAndFind(this.root, (book) => book.id === id, results, true);
      return results.length > 0 ? results[0] : null;
    }

    /**
     * Finds all books by a given author. (O(n) traversal)
     * @param {string} author - The author name to search for.
     * @returns {Book[]} - An array of matching book objects.
     */
    searchByAuthor(author) {
      const results = [];
      const searchLower = author.toLowerCase();
      this._traverseAndFind(
        this.root,
        (book) => book.author.toLowerCase().includes(searchLower),
        results,
        false
      );
      return results;
    }

    /**
     * Returns all books in the library, sorted by title.
     * @returns {Book[]} - A sorted array of all book objects.
     */
    getAllBooks() {
      const results = [];
      this._inOrderTraversal(this.root, results);
      return results;
    }

    /**
     * Counts all nodes (books) in the tree.
     * @returns {number}
     */
    count() {
      return this._countNodes(this.root);
    }

    // --- Private Helper Methods ---

    _insertNode(node, newNode) {
      const newTitle = newNode.book.title.toLowerCase();
      const nodeTitle = node.book.title.toLowerCase();

      if (newTitle < nodeTitle) {
        if (node.left === null) {
          node.left = newNode;
        } else {
          this._insertNode(node.left, newNode);
        }
      } else {
        if (node.right === null) {
          node.right = newNode;
        } else {
          this._insertNode(node.right, newNode);
        }
      }
    }

    _deleteNode(node, titleLower) {
      if (node === null) {
        return null; // Node not found
      }

      const nodeTitle = node.book.title.toLowerCase();

      // Find the node
      if (titleLower < nodeTitle) {
        node.left = this._deleteNode(node.left, titleLower);
        return node;
      } else if (titleLower > nodeTitle) {
        node.right = this._deleteNode(node.right, titleLower);
        return node;
      } else {
        // Found the node. Now, delete it.

        // Case 1: No children
        if (node.left === null && node.right === null) {
          return null;
        }

        // Case 2: One child
        if (node.left === null) {
          return node.right;
        }
        if (node.right === null) {
          return node.left;
        }

        // Case 3: Two children
        // Find the in-order successor (smallest node in the right subtree)
        const minNode = this._findMinNode(node.right);
        // Copy the successor's book data to this node
        node.book = minNode.book;
        // Delete the successor from the right subtree
        node.right = this._deleteNode(
          node.right,
          minNode.book.title.toLowerCase()
        );
        return node;
      }
    }

    /**
     * Finds the node with the minimum value (book title) in a subtree.
     */
    _findMinNode(node) {
      let current = node;
      while (current.left !== null) {
        current = current.left;
      }
      return current;
    }

    _searchTitle(node, titleLower) {
      if (node === null) return null;
      const nodeTitle = node.book.title.toLowerCase();
      if (titleLower === nodeTitle) return node.book;
      if (titleLower < nodeTitle)
        return this._searchTitle(node.left, titleLower);
      return this._searchTitle(node.right, titleLower);
    }

    _inOrderTraversal(node, results) {
      if (node !== null) {
        this._inOrderTraversal(node.left, results);
        results.push(node.book);
        this._inOrderTraversal(node.right, results);
      }
    }

    _traverseAndFind(node, conditionFn, results, stopOnFirst) {
      if (node === null) return;
      if (stopOnFirst && results.length > 0) return; // Optimization

      this._traverseAndFind(node.left, conditionFn, results, stopOnFirst);

      if (conditionFn(node.book)) {
        results.push(node.book);
        if (stopOnFirst) return;
      }

      if (stopOnFirst && results.length > 0) return; // Check again

      this._traverseAndFind(node.right, conditionFn, results, stopOnFirst);
    }

    _countNodes(node) {
      if (node === null) {
        return 0;
      }
      return 1 + this._countNodes(node.left) + this._countNodes(node.right);
    }
  }

  // --- APPLICATION LOGIC ---

  // Get DOM elements
  const bookListEl = document.getElementById("bookList");
  const statsDashboardEl = document.getElementById("statsDashboard");

  const searchQueryInput = document.getElementById("searchQuery");
  const searchTypeSelect = document.getElementById("searchType");
  const filterButtonsContainer = document.getElementById("filterButtons");

  // Modals
  const bookModal = document.getElementById("bookModal");
  const historyModal = document.getElementById("historyModal");
  const deleteModal = document.getElementById("deleteModal");

  // Modal Forms & Content
  const bookForm = document.getElementById("bookForm");
  const bookModalTitle = document.getElementById("bookModalTitle");
  const bookIdInput = document.getElementById("bookId");
  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");
  const historyListContainer = document.getElementById("historyListContainer");
  const historyBookTitle = document.getElementById("historyBookTitle");
  const deleteBookTitle = document.getElementById("deleteBookTitle");

  // Modal Buttons
  const openAddBookModalBtn = document.getElementById("openAddBookModal");
  const closeBookModalBtn = document.getElementById("closeBookModal");
  const closeHistoryModalBtn = document.getElementById("closeHistoryModal");
  const cancelDeleteButton = document.getElementById("cancelDeleteButton");
  const confirmDeleteButton = document.getElementById("confirmDeleteButton");

  // Toast
  const toastEl = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  // Initialize the library
  let library = new BinarySearchTree();

  // App state
  let currentFilter = "all"; // 'all', 'available', 'borrowed'
  let currentSearchQuery = "";
  let currentSearchType = "title";
  let bookToDelete = null; // Store book info for delete confirmation

  // --- Core Render Functions ---

  /**
   * Renders the statistics dashboard.
   */
  function renderDashboard() {
    const allBooks = library.getAllBooks();
    const total = allBooks.length;
    const available = allBooks.filter((b) => b.status === "Available").length;
    const borrowed = total - available;

    statsDashboardEl.innerHTML = `
                    <div class="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                        <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.523 5.754 19 7.5 19s3.332-.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.523 18.246 19 16.5 19s-3.332-.477-4.5-1.253" /></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Total Books</p>
                            <p class="text-3xl font-bold text-gray-900">${total}</p>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                        <div class="p-3 rounded-full bg-green-100 text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Available</p>
                            <p class="text-3xl font-bold text-gray-900">${available}</p>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                        <div class="p-3 rounded-full bg-red-100 text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 17L21 12 16 7M21 12L3 12" /></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Borrowed</p>
                            <p class="text-3xl font-bold text-gray-900">${borrowed}</p>
                        </div>
                    </div>
                `;
  }

  /**
   * Renders the book list based on current filters and search.
   */
  function renderBooks() {
    bookListEl.innerHTML = ""; // Clear the list
    let booksToShow = [];

    // 1. Apply Search
    if (currentSearchQuery) {
      const query = currentSearchQuery.toLowerCase();
      if (currentSearchType === "title") {
        // We must traverse, as searchByTitle only finds exact match
        booksToShow = library
          .getAllBooks()
          .filter((b) => b.title.toLowerCase().includes(query));
      } else {
        booksToShow = library.searchByAuthor(query);
      }
    } else {
      booksToShow = library.getAllBooks(); // Already sorted by BST
    }

    // 2. Apply Filter
    if (currentFilter !== "all") {
      booksToShow = booksToShow.filter(
        (book) => book.status.toLowerCase() === currentFilter
      );
    }

    // 3. Render HTML
    if (booksToShow.length === 0) {
      bookListEl.innerHTML = `<p class="text-gray-600 col-span-full text-center py-10">No books match your criteria.</p>`;
      return;
    }

    booksToShow.forEach((book) => {
      bookListEl.innerHTML += createBookCardHTML(book);
    });
  }

  /**
   * Helper to create HTML for a single book card.
   */
  function createBookCardHTML(book) {
    const isAvailable = book.status === "Available";
    const statusClass = isAvailable
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
    const buttonClass = isAvailable
      ? "bg-red-500 hover:bg-red-600"
      : "bg-green-500 hover:bg-green-600";
    const buttonText = isAvailable ? "Borrow" : "Return";

    return `
                    <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl flex">
                        <!-- Image Column -->
                        <div class="w-1/3 flex-shrink-0 max-w-[150px]">
                            <img src="${book.coverImage}" alt="Cover for ${book.title}" class="object-cover h-full w-full" onerror="this.src='https.placehold.co/400x600/ef4444/ffffff?text=Error'">
                        </div>

                        <!-- Content Column -->
                        <div class="w-2/3 flex flex-col flex-1">
                            <div class="p-4 flex-1">
                                <div class="flex justify-between items-start">
                                    <h3 class="text-lg font-bold text-gray-900" title="${book.title}">${book.title}</h3>
                                    <span class="flex-shrink-0 ml-2 inline-block px-3 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                                        ${book.status}
                                    </span>
                                </div>
                                <p class="text-md text-gray-600 italic mt-1">${book.author}</p>
                            </div>
                            
                            <div class="p-3 bg-gray-50 grid grid-cols-2 gap-3">
                                <button class="toggle-status-btn w-full py-2 px-3 rounded-md text-white text-sm font-medium ${buttonClass} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" data-id="${book.id}">
                                    ${buttonText}
                                </button>
                                <button class="view-history-btn w-full py-2 px-3 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 text-sm font-medium transition-colors" data-id="${book.id}">
                                    History
                                </button>
                            </div>

                            <div class="p-2 bg-gray-100 border-t border-gray-200 flex justify-end space-x-2">
                                <button class="edit-book-btn p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors" data-id="${book.id}" title="Edit">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                                </button>
                                <button class="delete-book-btn p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors" data-id="${book.id}" title="Delete">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
  }

  /**
   * Main function to refresh the entire UI.
   */
  function refreshUI() {
    renderDashboard();
    renderBooks();
  }

  // --- Modal & Toast Handlers ---

  function showModal(modal) {
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.remove("opacity-0");
      modal.querySelector(".modal-content").classList.remove("-translate-y-10");
    }, 10);
  }

  function closeModal(modal) {
    modal.classList.add("opacity-0");
    modal.querySelector(".modal-content").classList.add("-translate-y-10");
    setTimeout(() => modal.classList.add("hidden"), 300);
  }

  function showToast(message, type = "success") {
    toastMessage.textContent = message;
    toastEl.className = `toast fixed bottom-10 right-10 transform translate-y-20 text-white py-3 px-5 rounded-lg shadow-xl ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 3000);
  }

  // --- Event Handlers ---

  // Search
  searchQueryInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;
    renderBooks();
  });

  searchTypeSelect.addEventListener("change", (e) => {
    currentSearchType = e.target.value;
    renderBooks();
  });

  // Filter
  filterButtonsContainer.addEventListener("click", (e) => {
    const target = e.target.closest(".filter-btn");
    if (target) {
      currentFilter = target.dataset.filter;
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("filter-active");
        btn.classList.add("bg-gray-200", "hover:bg-gray-300");
      });
      target.classList.add("filter-active");
      target.classList.remove("bg-gray-200", "hover:bg-gray-300");
      renderBooks();
    }
  });

  // Handle Add/Edit/Delete clicks (Event Delegation)
  bookListEl.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".toggle-status-btn");
    const historyBtn = e.target.closest(".view-history-btn");
    const editBtn = e.target.closest(".edit-book-btn");
    const deleteBtn = e.target.closest(".delete-book-btn");

    if (toggleBtn) {
      const book = library.searchById(toggleBtn.dataset.id);
      if (book) {
        book.status = book.status === "Available" ? "Borrowed" : "Available";
        book.history.addEntry(book.status); // Add to Linked List
        refreshUI();
        showToast(`Book status updated to ${book.status}.`);
      }
    }

    if (historyBtn) {
      const book = library.searchById(historyBtn.dataset.id);
      if (book) {
        historyBookTitle.textContent = book.title;
        historyListContainer.innerHTML = "";
        const entries = book.history.getEntries(); // Get from Linked List
        if (entries.length === 0) {
          historyListContainer.innerHTML =
            '<p class="text-gray-500">No history found.</p>';
        }
        entries.forEach((entry) => {
          historyListContainer.innerHTML += `
                                <div class="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                                    <span class="font-medium text-gray-700">${
                                      entry.status
                                    }</span>
                                    <span class="text-xs text-gray-500">${entry.timestamp.toLocaleString()}</span>
                                </div>
                            `;
        });
        showModal(historyModal);
      }
    }

    if (editBtn) {
      const book = library.searchById(editBtn.dataset.id);
      if (book) {
        bookModalTitle.textContent = "Edit Book";
        bookIdInput.value = book.id;
        titleInput.value = book.title;
        authorInput.value = book.author;
        showModal(bookModal);
      }
    }

    if (deleteBtn) {
      const book = library.searchById(deleteBtn.dataset.id);
      if (book) {
        bookToDelete = book;
        deleteBookTitle.textContent = book.title;
        showModal(deleteModal);
      }
    }
  });

  // Modal: Open Add
  openAddBookModalBtn.addEventListener("click", () => {
    bookForm.reset();
    bookIdInput.value = "";
    bookModalTitle.textContent = "Add New Book";
    showModal(bookModal);
  });

  // Modal: Close
  [closeBookModalBtn, closeHistoryModalBtn, cancelDeleteButton].forEach(
    (btn) => {
      btn.addEventListener("click", () =>
        closeModal(btn.closest(".modal-backdrop"))
      );
    }
  );

  // Modal: Handle Add/Edit Form Submit
  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = bookIdInput.value;
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();

    if (!title || !author) return;

    if (id) {
      // --- Edit Logic ---
      const book = library.searchById(id);
      if (book) {
        const oldTitle = book.title;

        // Check if title changed AND new title already exists
        if (
          oldTitle.toLowerCase() !== title.toLowerCase() &&
          library.searchByTitle(title)
        ) {
          showToast(
            `A book with the title "${title}" already exists.`,
            "error"
          );
          return; // Stop execution
        }

        // 1. Delete from BST using old title
        library.delete(oldTitle);

        // 2. Update book object
        book.title = title;
        book.author = author;
        const titleShort = title.split(" ").slice(0, 3).join(" ");
        book.coverImage = `https://placehold.co/400x600/60a5fa/ffffff?text=${encodeURIComponent(
          titleShort
        )}`;
        book.history.addEntry("Edited");

        // 3. Re-insert book into BST
        library.insert(book);

        showToast("Book updated successfully!");
      }
    } else {
      // --- Add Logic ---
      // Check for duplicates
      if (library.searchByTitle(title)) {
        showToast(`A book with the title "${title}" already exists.`, "error");
        return; // Stop execution
      }

      library.insert(new Book(title, author));
      showToast("Book added successfully!");
    }

    refreshUI();
    closeModal(bookModal);
  });

  // Modal: Handle Delete Confirmation
  confirmDeleteButton.addEventListener("click", () => {
    if (bookToDelete) {
      library.delete(bookToDelete.title);
      refreshUI();
      closeModal(deleteModal);
      showToast(`"${bookToDelete.title}" was deleted.`, "success");
      bookToDelete = null;
    }
  });

  // --- INITIALIZATION ---

  function loadSampleData() {
    const samples = [
      { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
      { title: "1984", author: "George Orwell" },
      { title: "To Kill a Mockingbird", author: "Harper Lee" },
      { title: "Moby Dick", author: "Herman Melville" },
      { title: "Dune", author: "Frank Herbert" },
      { title: "The Catcher in the Rye", author: "J.D. Salinger" },
      // THIS IS THE FIX. The broken string is now correct.
      { title: "Pride and Prejudice", author: "Jane Austen" },
      { title: "The Hobbit", author: "J.R.R. Tolkien" },
      { title: "War and Peace", author: "Leo Tolstoy" },
      { title: "Brave New World", author: "Aldous Huxley" },
    ];

    samples.forEach((s) => library.insert(new Book(s.title, s.author)));

    // Make a few borrowed for demonstration
    const book1 = library.searchByTitle("1984");
    if (book1) {
      book1.status = "Borrowed";
      book1.history.addEntry("Borrowed");
    }
    const book2 = library.searchByTitle("Dune");
    if (book2) {
      book2.status = "Borrowed";
      book2.history.addEntry("Borrowed");
    }
  }

  loadSampleData();
  refreshUI();
});
