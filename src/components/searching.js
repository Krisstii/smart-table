// import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {
  // // @todo: #5.1 — настроить компаратор
  // const compare = createComparison(['skipEmptyTargetValues'], [rules.searchMultipleFields (searchField, ['date', 'customer', 'seller'], false)]);
  // return (data, state, action) => {
  //     // @todo: #5.2 — применить компаратор

  //     return data.filter(item => compare(item, state));
  // }

  return (query, state, action) => {
    // result заменили на query
    return state[searchField]
      ? Object.assign({}, query, {
          // проверяем, что в поле поиска было что-то введено
          search: state[searchField], // устанавливаем в query параметр
        })
      : query; // если поле с поиском пустое, просто возвращаем query без изменений
  };
}
