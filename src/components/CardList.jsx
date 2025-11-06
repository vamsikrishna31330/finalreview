import './CardList.css';

const CardList = ({ items, renderItem }) => {
  return <div className="card-list">{items.map((item) => renderItem(item))}</div>;
};

export default CardList;
