const { nanoid } = require('nanoid');
const books = require('./books');
const {
  failResponse, successResponse, errorResponse, bookMapped,
} = require('./utils');

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  if (name === undefined) {
    return h.response(failResponse({
      responseMessage: 'Gagal menambahkan buku. Mohon isi nama buku',
      withData: false,
    }))
      .code(400);
  }

  if (readPage > pageCount) {
    return h.response(failResponse({
      responseMessage: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      withData: false,
    }))
      .code(400);
  }

  books.push(newBook);
  console.log(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    return h.response(successResponse({
      responseMessage: 'Buku berhasil ditambahkan',
      responseData: { bookId: newBook.id },
    }))
      .code(201);
  }

  return h.response(errorResponse(
    'Buku gagal ditambahkan',
  ))
    .code(500);
};

const getAllBookHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  if (name !== undefined) {
    const filteredBookByName = books.filter((book) => {
      const nameRegex = new RegExp(name, 'gi');
      return nameRegex.test(book.name);
    });
    return h.response(successResponse({
      responseData: { books: bookMapped(filteredBookByName) },
    }))
      .code(200);
  }

  if (reading !== undefined) {
    const filterBookByReading = books.filter((book) => Number(book.reading) === Number(reading));
    return h.response(successResponse({
      responseData: { books: bookMapped(filterBookByReading) },
    }))
      .code(200);
  }

  if (finished) {
    const filterBookByFinished = books.filter((book) => Number(book.finished) === Number(finished));
    return h.response(successResponse({
      responseData: { books: bookMapped(filterBookByFinished) },
    }))
      .code(200);
  }

  return h.response(successResponse({
    responseData: { books: bookMapped(books) },
  }))
    .code(200);
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const book = books.filter((b) => b.id === id)[0];
  if (book !== undefined) {
    return h.response(successResponse({
      responseData: { book },
    }))
      .code(200);
  }

  return h.response(failResponse({
    responseMessage: 'Buku tidak ditemukan',
    withData: false,
  }))
    .code(404);
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === id);
  if (name === undefined) {
    return h.response(failResponse({
      responseMessage: 'Gagal memperbarui buku. Mohon isi nama buku',
      withData: false,
    }))
      .code(400);
  }

  if (readPage > pageCount) {
    return h.response(failResponse({
      responseMessage: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      withData: false,
    }))
      .code(400);
  }

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    return h.response(successResponse({
      responseMessage: 'Buku berhasil diperbarui',
    }))
      .code(200);
  }

  return h.response(failResponse({
    responseMessage: 'Gagal memperbarui buku. Id tidak ditemukan',
    withData: false,
  }))
    .code(404);
};

const deleteBookById = (request, h) => {
  const { id } = request.params;
  const index = books.findIndex((b) => b.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    return h.response(successResponse({
      responseMessage: 'Buku berhasil dihapus',
    }))
      .code(200);
  }

  return h.response(failResponse({
    responseMessage: 'Buku gagal dihapus. Id tidak ditemukan',
    withData: false,
  }))
    .code(404);
};

module.exports = {
  addBookHandler, getAllBookHandler, getBookByIdHandler, editBookByIdHandler, deleteBookById,
};
