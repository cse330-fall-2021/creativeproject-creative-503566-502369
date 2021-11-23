/*
Navicat MySQL Data Transfer

Source Server         : laradock-mariadb
Source Server Version : 50505
Source Host           : 127.0.0.1:3306
Source Database       : CSE503S_final

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2021-11-23 12:02:27
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `current_session_id` varchar(255) DEFAULT NULL,
  `login_status` tinyint(4) NOT NULL DEFAULT 0,
  `create_time` datetime NOT NULL,
  `last_update_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('1', 'hehe', '$2b$10$cMPPONOeiYhd8bWay7gZnOsB9MBvQZm1PyquQAGNkjvebrNP00xJq', 'LaxwWKtSKGkfXeX_pTGmM3F-0K7TkQ1t', '1', '2021-11-14 17:52:03', '2021-11-23 00:44:44');
INSERT INTO `users` VALUES ('2', 'admin', '$2b$10$vh/fQFFfDuf.lPKOXTxw7u65w4qEr98pV63W6KXe.qG7Cg.ujB2Ne', 'WMB-ydJ_mbhzYZhQL91bQ-XUBocZPmx8', '1', '2021-11-14 20:19:18', '2021-11-22 21:25:35');
INSERT INTO `users` VALUES ('3', 'a', '$2b$10$0fMt.VmXTUqZgp5LkGhtS.LYRfWAH9xkPk4d/KXH0LHkueC7LsOMe', 'GGyM_8x_r-ZUR8y98Ewq6w8v7BDWI1kN', '1', '2021-11-15 20:43:22', '2021-11-23 18:01:30');
