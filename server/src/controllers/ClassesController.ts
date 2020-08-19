import { Request, Response } from 'express';

import db from '../database/connections';
import convertHoursInMinutes from '../utils/convertHoursInMinutes';

interface ScheduleItem {
  week_day: number,
  from: string,
  to:string
}

export default class ClassesController {
  async index(request: Request, response: Response) {
    const filters = request.query;

    const week_day = filters.week_day as string;
    const subject = filters.subject as string;
    const time = filters.time as string;

    if(!filters.week_day || !filters.subject || !filters.time) {
      return response.status(400).json({
        error: 'Missing filters to search classes.'
      });
    }

    const timeInMinutes = convertHoursInMinutes(time);

    const classes = await db('classes')
      .whereExists(function () {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
          .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
          .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
      })
      .where('classes.subject', '=', subject)
      .join('users', 'classes.user_id', '=', 'users.id')
      .select(['classes.*', 'users.*']);

    return response.json(classes);
  }
  async create(request: Request, response: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule
    } = request.body;

    const trans = await db.transaction();

    try {
      const insertedUserIds = await trans('users').insert({
        name,
        avatar,
        whatsapp,
        bio
      });

      const user_id = insertedUserIds[0];

      const insertedClassesIds = await trans('classes').insert({
        subject,
        cost,
        user_id
      });

      const class_id = insertedClassesIds[0];

      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          week_day: scheduleItem.week_day,
          from: convertHoursInMinutes(scheduleItem.from),
          to: convertHoursInMinutes(scheduleItem.to),
          class_id
        }
      });

      await trans('class_schedule').insert(classSchedule);

      await trans.commit();

      return response.status(201).send();
    } catch (error) {
      await trans.rollback();

      return response.status(400).json({
        error: 'Unexpected error while creating a new class.'
      });
    }
  }
}