import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './index';

// ===== Series =====

export function useSeriesList() {
  return useLiveQuery(() => db.series.orderBy('createdAt').reverse().toArray());
}

export function useSeries(id: number | undefined) {
  return useLiveQuery(() => (id ? db.series.get(id) : undefined), [id]);
}

// ===== Books =====

export function useBooksBySeries(seriesId: number | undefined) {
  return useLiveQuery(
    () => (seriesId ? db.books.where('seriesId').equals(seriesId).toArray() : []),
    [seriesId]
  );
}

export function useStandaloneBooks() {
  return useLiveQuery(() =>
    db.books
      .filter((book: { seriesId?: number }) => !book.seriesId)
      .toArray()
  );
}

export function useAllBooks() {
  return useLiveQuery(() => db.books.orderBy('createdAt').reverse().toArray());
}

export function useBook(id: number | undefined) {
  return useLiveQuery(() => (id ? db.books.get(id) : undefined), [id]);
}

// ===== Chapters =====

export function useChaptersByBook(bookId: number | undefined) {
  return useLiveQuery(
    () =>
      bookId
        ? db.chapters.where('bookId').equals(bookId).sortBy('order')
        : [],
    [bookId]
  );
}

export function useChapter(id: number | undefined) {
  return useLiveQuery(() => (id ? db.chapters.get(id) : undefined), [id]);
}

// ===== Chapter Versions =====

export function useChapterVersions(chapterId: number | undefined) {
  return useLiveQuery(
    () =>
      chapterId
        ? db.chapterVersions
            .where('chapterId')
            .equals(chapterId)
            .reverse()
            .sortBy('createdAt')
        : [],
    [chapterId]
  );
}

// ===== Settings =====

export function useSettings() {
  return useLiveQuery(() => db.settings.toCollection().first());
}
