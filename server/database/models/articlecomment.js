export default (sequelize, DataTypes) => {
  const ArticleComment = sequelize.define('ArticleComment', {
    articleId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    totalLikes: DataTypes.INTEGER
  }, {});
  ArticleComment.associate = (models) => {
    const { CommentEditHistory, Article, User } = models;
    ArticleComment.belongsTo(User, {
      foreignKey: 'userId',
    });
    ArticleComment.belongsTo(Article, {
      foreignKey: 'articleId',
    });
    ArticleComment.hasMany(CommentEditHistory, {
      foreignKey: 'id',
    });
  };
  return ArticleComment;
};
