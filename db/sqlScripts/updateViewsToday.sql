/*to show all process that is running, including the event_scheduler
SHOW processlist;*/

/*to show all events
SHOW EVENTS FROM classicmodels;*/

/*to drop events
DROP EVENT IF EXISTS update_viewsToday;*/

SET GLOBAL event_scheduler =ON;

CREATE EVENT IF NOT EXISTs update_viewsToday
ON SCHEDULE EVERY 1 DAY
STARTS /*TIMESTAMPS('2018-10-13 00:00:00')*/ CURRENT_TIMESTAMP
DO
	UPDATE Practitioner
    SET viewsToday=0;