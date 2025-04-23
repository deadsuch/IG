import React from 'react';
import { motion } from 'framer-motion';
import { FaGlobeAmericas, FaUserFriends, FaThumbsUp, FaAward } from 'react-icons/fa';
import { TbWorldHeart } from "react-icons/tb";
import { MdTravelExplore } from "react-icons/md";

const About = () => {
  // Анимация для основного контейнера
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
        duration: 0.5
      }
    }
  };

  // Анимация для элементов
  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Анимация для изображений
  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  // Анимация для статистических карточек
  const statCardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="about-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.section className="hero-section" variants={itemVariants}>
        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Откройте мир вместе с нами
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Мы создаем незабываемые путешествия с 2010 года
          </motion.p>
        </div>
      </motion.section>

      <motion.section className="about-section" variants={itemVariants}>
        <div className="about-content">
          <motion.div className="about-text" variants={itemVariants}>
            <h2 className="section-title">О нашей компании</h2>
            <p>
              Наше туристическое агентство основано опытными путешественниками, которые решили 
              превратить свою страсть в профессию. Мы специализируемся на создании индивидуальных 
              маршрутов, которые отражают ваши интересы и предпочтения.
            </p>
            <p>
              Наша миссия — открывать новые горизонты и делать путешествия доступными для всех. 
              Мы верим, что каждое путешествие должно быть особенным и незабываемым.
            </p>

            <div className="company-values">
              <motion.div 
                className="value-item"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <FaGlobeAmericas className="value-icon" />
                <h3>Открытость миру</h3>
              </motion.div>
              
              <motion.div 
                className="value-item"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <FaUserFriends className="value-icon" />
                <h3>Индивидуальный подход</h3>
              </motion.div>
              
              <motion.div 
                className="value-item"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <FaThumbsUp className="value-icon" />
                <h3>Качество сервиса</h3>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="about-image-container"
            variants={imageVariants}
          >
            <img 
              src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
              alt="Путешествие" 
              className="about-image"
            />
          </motion.div>
        </div>
      </motion.section>

      <motion.section className="stats-section" variants={itemVariants}>
        <h2 className="section-title">Наши достижения</h2>
        <div className="stats-container">
          <motion.div 
            className="stat-card"
            variants={statCardVariants}
            whileHover="hover"
          >
            <MdTravelExplore className="stat-icon" />
            <h3>5000+</h3>
            <p>Успешных туров</p>
          </motion.div>

          <motion.div 
            className="stat-card"
            variants={statCardVariants}
            whileHover="hover"
          >
            <FaUserFriends className="stat-icon" />
            <h3>10000+</h3>
            <p>Счастливых клиентов</p>
          </motion.div>

          <motion.div 
            className="stat-card"
            variants={statCardVariants}
            whileHover="hover"
          >
            <TbWorldHeart className="stat-icon" />
            <h3>50+</h3>
            <p>Стран мира</p>
          </motion.div>

          <motion.div 
            className="stat-card"
            variants={statCardVariants}
            whileHover="hover"
          >
            <FaAward className="stat-icon" />
            <h3>25+</h3>
            <p>Наград и премий</p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section className="team-section" variants={itemVariants}>
        <h2 className="section-title">Наша команда</h2>
        <div className="team-grid">
          <motion.div 
            className="team-member"
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="member-image-container">
              <img 
                src="https://randomuser.me/api/portraits/women/44.jpg" 
                alt="Елена Петрова" 
                className="member-image"
              />
            </div>
            <h3>Елена Петрова</h3>
            <p>Основатель и CEO</p>
          </motion.div>

          <motion.div 
            className="team-member"
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="member-image-container">
              <img 
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Александр Иванов" 
                className="member-image"
              />
            </div>
            <h3>Александр Иванов</h3>
            <p>Директор по туризму</p>
          </motion.div>

          <motion.div 
            className="team-member"
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="member-image-container">
              <img 
                src="https://randomuser.me/api/portraits/women/68.jpg" 
                alt="Мария Сидорова" 
                className="member-image"
              />
            </div>
            <h3>Мария Сидорова</h3>
            <p>Руководитель клиентского сервиса</p>
          </motion.div>

          <motion.div 
            className="team-member"
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="member-image-container">
              <img 
                src="https://randomuser.me/api/portraits/men/75.jpg" 
                alt="Дмитрий Козлов" 
                className="member-image"
              />
            </div>
            <h3>Дмитрий Козлов</h3>
            <p>Главный менеджер по направлениям</p>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default About; 