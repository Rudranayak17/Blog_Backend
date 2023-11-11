class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  search() {
    
    if (this.queryStr.keyword) {
      this.query = this.query.find({
        title: {
          $regex: this.queryStr.keyword,
          $options: "i",
        },
      });
    }
    return this;
  }
  sort() {
  
    const sort = this.queryStr.sort
    ? {
        tags: {
          $regex:this.queryStr.sort,
          $options:"i",
        },
      }
    : {};

  this.query = this.query.find({ ...sort });
  
    return this;
  }
  mostViews() {
    if (this.queryStr.mostViews === 'true') {
      // Sort by most views in descending order
      this.query = this.query.sort({ views: -1 });
      // console.log(this.queryStr.mostViews);
      console.log(this.query);
    } else {
      // If mostViews is 'false' or not provided, revert to the default sorting (e.g., by date)
      // You can replace the { createdAt: -1 } with your default sorting criteria
      this.query = this.query.sort({ createdAt: -1 });
      // console.log(this.queryStr.mostViews);
    }
    return this;
  }
  
  mostLikes() {
    if (this.queryStr.mostLikes === "false") {
      // Sort by most likes in descending order
      this.query = this.query.sort({ likes: -1 });

    }else {
      // If mostViews is 'false' or not provided, revert to the default sorting (e.g., by date)
      // You can replace the { createdAt: -1 } with your default sorting criteria
      this.query = this.query.sort({ createdAt: -1 });
      // console.log(this.queryStr.mostViews);
    }
    return this;
  }
  trendingWithinMonth() {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    this.query = this.query
      .find({ createdAt: { $gte: lastMonth, $lte: today } })
      .sort({ views: -1 });

    return this;
  }
  paginate(page, resultPerPage) {
    page = parseInt(page);
    resultPerPage = parseInt(resultPerPage);
    const skip = (page - 1) * resultPerPage;
    this.query = this.query.skip(skip).limit(resultPerPage);
    return this;
  }
  

}
export default ApiFeatures 