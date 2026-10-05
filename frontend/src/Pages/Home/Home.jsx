import React from 'react'
import HeroSection from '../../Component/HeroSection/HeroSection'
import HomeBook from '../../Component/HomeBook/HomeBook'
import TopBook from '../../Component/TopBook/TopBook'
import BookleBook from '../../Component/BookleBook/BookleBook'
import RatingBook from '../../Component/RatingBook/RatingBook'
import TopSelling from '../../Component/TopSelling/TopSelling'
import HomeReview from '../../Component/HomeReview/HomeReview'
import HomeAuthor from '../../Component/HomeAuthor/HomeAuthor'
import HomeNews from '../../Component/HomeNews/HomeNews'

const Home = () => {
  return (
    <div>
      <HeroSection/>
      <HomeBook/>
      <TopBook/>
      <BookleBook/>
      <RatingBook/>
      <TopSelling/>
      <HomeReview/>
      <HomeAuthor/>
      <HomeNews/>
    </div>
  )
}

export default Home