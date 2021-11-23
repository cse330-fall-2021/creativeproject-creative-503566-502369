/*
Navicat MySQL Data Transfer

Source Server         : laradock-mariadb
Source Server Version : 50505
Source Host           : 127.0.0.1:3306
Source Database       : CSE503S_final

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2021-11-23 12:02:18
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for draw_words
-- ----------------------------
DROP TABLE IF EXISTS `draw_words`;
CREATE TABLE `draw_words` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `draw_word` varchar(255) DEFAULT NULL,
  `word_type` int(10) unsigned DEFAULT 0,
  `word_type_2` int(255) unsigned DEFAULT 0,
  `delete_flag` int(255) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of draw_words
-- ----------------------------
INSERT INTO `draw_words` VALUES ('1', 'Baby', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('2', 'Rainbow', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('3', 'Pumpkin', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('4', 'Fireworks', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('5', 'Snowflake', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('6', 'Strawberry', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('7', 'Lion', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('8', 'Cat', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('9', 'Church', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('10', 'Mailbox', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('11', 'Toothbrush', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('12', 'Toast', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('13', 'Toothpaste', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('14', 'Truck', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('15', 'Peanut', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('16', 'Egg', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('17', 'Ice cream cone', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('18', 'Bikini', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('19', 'Stairs', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('20', 'Camera', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('21', 'Butterfly', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('22', 'Dolphin', '0', '0', '0');
INSERT INTO `draw_words` VALUES ('23', 'Glasses', '0', '0', '0');
