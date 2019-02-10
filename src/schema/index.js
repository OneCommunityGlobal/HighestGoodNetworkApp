import Joi from "joi";

export const TimeEntryschema = {
  date: Joi.string()
    .required()
    .label("Date")
    .options({
      language: {
        string: {
          regex: {
            base: "Please select a date"
          }
        }
      }
    }),

  minutes: Joi.number()
    .min(0)
    .max(59)
    .label("minutes")
    .options({
      language: {
        string: {
          regex: {
            base: "0 through 59"
          }
        }
      }
    }),

  hours: Joi.number()
    .min(0)
    .max(23)
    .label("hours")
    .options({
      language: {
        string: {
          regex: {
            base: "0 through 23"
          }
        }
      }
    }),

  tangible: Joi.label("Tangible"),

  projectId: Joi.string()
    .required()
    .label("Projects"),

  notes: Joi.string().label("notes")
};


export const updatePasswordSchema = {
  currentpassword: Joi.string()
    .required()
    .label("Current Password"),
  newpassword: Joi.string()
    .regex(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
    .required()
    .disallow(Joi.ref("currentpassword"))
    .label("New Password")
    .options({
      language: {
        any: {
          invalid: "should not be same as old password"
        },
        string: {
          regex: {
            base:
              "should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character"
          }
        }
      }
    }),

  confirmnewpassword: Joi.any()
    .valid(Joi.ref("newpassword"))
    .options({ language: { any: { allowOnly: "must match new password" } } })
    .label("Confirm Password")
};
